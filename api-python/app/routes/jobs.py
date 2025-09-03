from fastapi import APIRouter, Depends
from .auth import get_current_user
from app.core.authz import require_role, require_org_member

router = APIRouter()

# Public-to-org (any role) browsing:
@router.get("", summary="List jobs")
async def list_jobs(q: str | None = None, user=Depends(require_org_member)):
    return {"query": q, "items": []}

@router.get("/{job_id}", summary="Get job by id")
async def get_job(job_id: str, user=Depends(require_org_member)):
    return {"id": job_id, "title": "Sample Job", "status": "open"}

# Admin-only management:
@router.post("", summary="Create job")
async def create_job(job: dict, user=Depends(require_role("org:admin"))):
    return {"id": "new-id", **job}

@router.patch("/{job_id}", summary="Update job")
async def update_job(job_id: str, patch: dict, user=Depends(require_role("org:admin"))):
    return {"id": job_id, **patch}

@router.delete("/{job_id}", summary="Delete job")
async def delete_job(job_id: str, user=Depends(require_role("org:admin"))):
    return {"deleted": job_id}

@router.get("/{job_id}/candidates", summary="Matched candidates for a job")
async def matched_candidates(job_id: str, user=Depends(require_role("org:admin"))):
    return {"job_id": job_id, "candidates": []}
