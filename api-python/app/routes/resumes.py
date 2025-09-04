from app.core.authz import require_role
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import uuid4
from app.db.session import get_session
from app.repositories.resume_repo import create_resume
from app.workers.tasks import parse_resume_task  # celery task wrapper shown below
from app.models.resume import ResumeIngestRequest


router = APIRouter()

# Members upload/ingest their resumes:
@router.post("/ingest", summary="Ingest a resume (async pipeline)")
async def ingest_resume(blob_url: str, user=Depends(require_role("org:member"))):
    return {"message": "ingest accepted", "blob_url": blob_url, "requested_by": user.get("sub")}

# Admin views normalized features for any resume:
@router.get("/{resume_id}/features", summary="Get normalized resume features")
async def get_features(resume_id: str, user=Depends(require_role("org:admin"))):
    return {"resume_id": resume_id, "features": {"skills": [], "education": [], "experience": []}}



router = APIRouter(prefix="/v1/resumes", tags=["resumes"])

@router.post("/ingest")
async def ingest_resume(payload: ResumeIngestRequest, session: AsyncSession = Depends(get_session)):
    # TODO: get current user id from auth (Clerk) if you pass it through
    # For now, create a synthetic user id or require it in the payload
    user_id = uuid4()

    obj = await create_resume(
        session,
        user_id=user_id,
        file_name=payload.file_name or "resume",
        mime_type=payload.mime_type or "application/octet-stream",
        size_bytes=payload.size_bytes or 0,
        blob_url=payload.blob_url,
    )
    await session.commit()

    # Prefer SAS for Doc Intel so it can fetch private blob
    sas = payload.blob_sas_url or payload.blob_url

    # Fire-and-forget Celery task
    parse_resume_task.delay(str(obj.id), sas)

    return { "resume_id": str(obj.id), "status": "queued" }