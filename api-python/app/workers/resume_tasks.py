from __future__ import annotations

import asyncio
import logging
import uuid
from typing import Any, Dict

from celery import shared_task
from sqlalchemy.ext.asyncio import AsyncSession

from app.workers.celery_app import celery_app
from app.db.session import async_session
from app.services.parsing import parse_resume_via_docintel

log = logging.getLogger(__name__)


async def _run_parse(resume_id: uuid.UUID, blob_sas_url: str) -> Dict[str, Any]:
    async with async_session() as session:  # type: AsyncSession
        raw, normalized = await parse_resume_via_docintel(
            session,
            resume_id=resume_id,
            blob_sas_url=blob_sas_url,
        )
        return {"raw": raw, "normalized": normalized}


@celery_app.task(name="resume.parse_via_docintel", bind=True, max_retries=2)
def parse_resume_task(self, resume_id: str, blob_sas_url: str) -> Dict[str, Any]:
    """
    Parse a resume in Azure Document Intelligence, normalize and upsert features.
    """
    try:
        rid = uuid.UUID(resume_id)
    except Exception as ex:
        raise ValueError(f"Invalid resume_id: {resume_id}") from ex

    try:
        result = asyncio.run(_run_parse(rid, blob_sas_url))
        log.info("resume_parse_task_done", extra={"resume_id": resume_id})
        return result
    except Exception as ex:
        # If Doc Intel throttles or transient errors occur, retry once
        try:
            raise self.retry(exc=ex, countdown=5)
        except Exception:
            log.exception("resume_parse_task_failed", extra={"resume_id": resume_id})
            raise
