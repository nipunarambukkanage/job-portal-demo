from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, Body, Header, HTTPException, Query, Response, status

from app.db.session import async_session
from app.repositories.resume_repo import create_resume
from app.repositories.application_repo import create_application
from app.schemas.resume import ResumeIngestRequest

router = APIRouter()

@router.options("/ingest")
async def options_ingest() -> Response:
    return Response(status_code=status.HTTP_200_OK)

@router.post("/ingest", summary="Ingest a resume (async pipeline) — public")
async def ingest_resume(
    payload: ResumeIngestRequest | None = Body(default=None),
    blob_url_q: str | None = Query(default=None),
    # Header you already use from the frontend to tie to a specific user:
    x_user_id: str | None = Header(default=None, alias="X-User-Id"),
):
    if payload is None and not blob_url_q:
        raise HTTPException(status_code=422, detail="Missing body or 'blob_url' query parameter")

    blob_url = payload.blob_url if payload else blob_url_q
    file_name = (payload.file_name if payload else None) or "resume"
    mime_type = (payload.mime_type if payload else None) or "application/octet-stream"
    size_bytes = (payload.size_bytes if payload else None) or 0
    job_id = payload.job_id if payload else None

    # pick up the caller's user id (UUID). If absent or not a UUID, synthesize.
    try:
        user_id = uuid.UUID(x_user_id) if x_user_id else uuid.uuid4()
    except Exception:
        user_id = uuid.uuid4()

    async with async_session() as session:
        # 1) store resume record
        resume = await create_resume(
            session,
            user_id=user_id,
            file_name=file_name,
            mime_type=mime_type,
            size_bytes=size_bytes,
            blob_url=str(blob_url),
        )

        # 2) optionally create an application row in Python DB, linked to this resume
        application_id: uuid.UUID | None = None
        if job_id:
            try:
                app_obj = await create_application(
                    session,
                    job_id=job_id,
                    candidate_id=user_id,   # must exist in pyapi.user
                    resume_id=resume.id,
                    cover_letter=None,
                )
                application_id = app_obj.id
            except Exception:
                # Do not fail the whole ingest if the app insert fails
                application_id = None

        await session.commit()

    return {
        "resume_id": str(resume.id),
        "status": "queued",
        "blob_url": str(blob_url),
        "job_id": str(job_id) if job_id else None,
        "application_id": str(application_id) if application_id else None,
    }
