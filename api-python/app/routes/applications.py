from fastapi import APIRouter, Depends
from .auth import get_current_user

router = APIRouter()

@router.post("", summary="Apply to a job")
async def apply(job_id: str, resume_id: str, user=Depends(get_current_user)):
    return {"status": "submitted", "job_id": job_id, "resume_id": resume_id, "applicant": user.get("sub")}

@router.get("/{application_id}", summary="Get application status")
async def get_application(application_id: str, user=Depends(get_current_user)):
    return {"id": application_id, "status": "received"}
