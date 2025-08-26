from __future__ import annotations

import asyncio
import logging
from typing import Any, Dict, Tuple
import httpx
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.models.resume import ParseStatus
from app.repositories.resume_repo import (
    set_resume_parse_status,
    save_resume_raw_docintel,
)
from app.repositories.resume_features_repo import upsert_resume_features
from app.services.normalize import normalize_docintel_resume

log = logging.getLogger(__name__)


async def _docintel_analyze_url(blob_sas_url: str) -> Dict[str, Any]:
    """
    Calls Azure Document Intelligence prebuilt-resume with a URL source.
    Returns the final analysis JSON (status='succeeded') or raises on failure/timeout.
    """
    settings = get_settings()
    if not settings.AZURE_DOC_INTEL_ENDPOINT or not settings.AZURE_DOC_INTEL_KEY:
        raise RuntimeError("Azure Document Intelligence is not configured")

    analyze_url = (
        f"{settings.AZURE_DOC_INTEL_ENDPOINT}/formrecognizer/"
        f"documentModels/{settings.DOC_INTEL_MODEL}:analyze"
        f"?api-version={settings.DOC_INTEL_API_VERSION}"
    )

    headers = {
        "Ocp-Apim-Subscription-Key": settings.AZURE_DOC_INTEL_KEY,
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(analyze_url, headers=headers, json={"urlSource": blob_sas_url})
        resp.raise_for_status()
        op_loc = resp.headers.get("operation-location")
        if not op_loc:
            raise RuntimeError("Doc Intel did not return operation-location header")

        attempts = max(1, settings.DOC_INTEL_POLL_ATTEMPTS)
        delay = max(1, settings.DOC_INTEL_POLL_SECONDS)

        for i in range(attempts):
            r = await client.get(op_loc, headers={"Ocp-Apim-Subscription-Key": settings.AZURE_DOC_INTEL_KEY})
            r.raise_for_status()
            data = r.json()
            status = data.get("status")
            if status == "succeeded":
                return data
            if status == "failed":
                raise RuntimeError(f"Doc Intel analysis failed: {data}")
            await asyncio.sleep(delay)

    raise TimeoutError("Doc Intel analysis timed out")


async def parse_resume_via_docintel(
    session: AsyncSession,
    *,
    resume_id: "uuid.UUID",
    blob_sas_url: str,
) -> Tuple[Dict[str, Any], Dict[str, Any]]:
    """
    Orchestrates a full parse:
    1) call Doc Intel
    2) persist trimmed raw JSON
    3) normalize to our features shape
    4) upsert features
    5) mark parse status
    Returns (raw_json, normalized_features_dict)
    """
    import uuid  # local import to avoid circular typing issues

    try:
        log.info("docintel_analyze_start", extra={"resume_id": str(resume_id)})
        raw = await _docintel_analyze_url(blob_sas_url)

        # Save a trimmed raw result (avoid storing extremely large payloads)
        trimmed = {
            "status": raw.get("status"),
            "createdDateTime": raw.get("createdDateTime"),
            "lastUpdatedDateTime": raw.get("lastUpdatedDateTime"),
            "modelId": raw.get("modelId"),
            "documents": raw.get("documents", []),
            "content": raw.get("content", "")[:100000],  # guard huge text
        }
        await save_resume_raw_docintel(session, resume_id=resume_id, raw_json=trimmed)

        # Normalize
        normalized = normalize_docintel_resume(trimmed)

        # Upsert features
        await upsert_resume_features(
            session,
            resume_id=resume_id,
            full_name=normalized.get("full_name"),
            email=normalized.get("email"),
            phone=normalized.get("phone"),
            summary=normalized.get("summary"),
            skills=normalized.get("skills"),
            languages=normalized.get("languages"),
            education=normalized.get("education"),
            experience=normalized.get("experience"),
            certifications=normalized.get("certifications"),
            total_experience_months=normalized.get("total_experience_months"),
        )

        await set_resume_parse_status(session, resume_id=resume_id, status=ParseStatus.parsed)
        log.info("docintel_analyze_done", extra={"resume_id": str(resume_id)})
        return trimmed, normalized

    except Exception as ex:
        await set_resume_parse_status(
            session,
            resume_id=resume_id,
            status=ParseStatus.failed,
            parse_error=str(ex)[:950],
        )
        log.exception("docintel_analyze_error", extra={"resume_id": str(resume_id)})
        raise
