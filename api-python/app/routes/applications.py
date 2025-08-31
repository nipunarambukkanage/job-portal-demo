from fastapi import APIRouter, Depends
from app.core.authz import require_role

router = APIRouter()

# Members apply to jobs:
@router.post("", summary="Apply to a job")
async def apply(job_id: str, resume_id: str, user=Depends(require_role("member"))):
    return {"status": "submitted", "job_id": job_id, "resume_id": resume_id, "applicant": user.get("sub")}

# Admin can review application details:
@router.get("/{application_id}", summary="Get application status (admin)")
async def get_application(application_id: str, user=Depends(require_role("admin"))):
    return {"id": application_id, "status": "received"}
