from __future__ import annotations

import uuid
from typing import Optional

from fastapi import APIRouter, Body, Header, HTTPException, Query, Response, status
from sqlalchemy.exc import IntegrityError

from app.db.session import async_session
from app.schemas.resume import ResumeIngestRequest
from app.repositories.resume_repo import create_resume
from app.repositories.application_repo import create_application
from app.repositories.job_repo import get_job

router = APIRouter()


@router.options("/ingest")
async def options_ingest() -> Response:
    return Response(status_code=status.HTTP_200_OK)

@router.post("/ingest", summary="Ingest a resume and (optionally) create application")
async def ingest_resume(
    payload: ResumeIngestRequest = Body(...),
    x_user_id: Optional[str] = Header(default=None, convert_underscores=False, alias="X-User-Id"),
):
    # Require a valid user_id so resume FK to user succeeds
    if not x_user_id:
        raise HTTPException(status_code=400, detail="Missing X-User-Id header")
    try:
        user_id = uuid.UUID(x_user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="X-User-Id must be a GUID")

    async with async_session() as session:
        resume = None
        application_id: Optional[uuid.UUID] = None
        try:
            resume = await create_resume(
                session,
                user_id=user_id,
                file_name=payload.file_name or "resume",
                mime_type=payload.mime_type or "application/octet-stream",
                size_bytes=payload.size_bytes or 0,
                blob_url=str(payload.blob_url),
            )
            await session.flush()

            if payload.job_id:
                job = await get_job(session, payload.job_id)
                if job:
                    app_obj = await create_application(
                        session,
                        job_id=payload.job_id,
                        candidate_id=user_id,
                        resume_id=resume.id,
                        cover_letter=None,
                    )
                    await session.flush()
                    application_id = app_obj.id

            await session.commit()

        except IntegrityError as ex:
            await session.rollback()
            # surface a safe message
            raise HTTPException(status_code=400, detail="Could not save resume/application (FK or unique constraint).") from ex

        return {
            "resume_id": str(resume.id),
            "status": "queued",
            "blob_url": str(payload.blob_url),
            "job_id": str(payload.job_id) if payload.job_id else None,
            "application_id": str(application_id) if application_id else None,
            "application_created": application_id is not None,
        }
