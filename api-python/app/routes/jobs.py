from fastapi import APIRouter, Depends
from .auth import get_current_user

router = APIRouter()

@router.get("", summary="List jobs")
async def list_jobs(q: str | None = None, user=Depends(get_current_user)):
    return {"query": q, "items": []}

@router.get("/{job_id}", summary="Get job by id")
async def get_job(job_id: str, user=Depends(get_current_user)):
    return {"id": job_id, "title": "Sample Job", "status": "open"}

@router.get("/{job_id}/candidates", summary="Matched candidates for a job")
async def matched_candidates(job_id: str, user=Depends(get_current_user)):
    return {"job_id": job_id, "candidates": []}
