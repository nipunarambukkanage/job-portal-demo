"""
Job Routes

Handles HTTP requests for job-related operations using the service layer.
"""
from __future__ import annotations

import uuid
from typing import Dict, Any

from fastapi import APIRouter, Depends, Query, status
from fastapi.responses import JSONResponse

from app.core.dependencies import get_job_service, current_user_dep
from app.services.job_service import JobService
from app.schemas.job import (
    JobCreateRequest,
    JobUpdateRequest,
    JobResponse,
    JobListResponse,
    EmploymentType,
)
from app.core.authz import require_role, require_org_member

router = APIRouter(tags=["jobs"])


@router.get("", response_model=JobListResponse, summary="List jobs")
async def list_jobs(
    q: str | None = Query(None, max_length=100, description="Search query"),
    skills: list[str] | None = Query(None, description="Filter by skills"),
    employment_type: EmploymentType | None = Query(None, description="Filter by employment type"),
    only_active: bool = Query(True, description="Only show active jobs"),
    page: int = Query(1, ge=1, description="Page number (1-based)"),
    size: int = Query(20, ge=1, le=100, description="Page size (1-100)"),
    job_service: JobService = Depends(get_job_service),
    user: Dict[str, Any] = Depends(require_org_member),
) -> JobListResponse:
    """
    List jobs with optional filtering and pagination.
    
    - **q**: Search in title, description, and location
    - **skills**: Filter by required skills (can specify multiple)
    - **employment_type**: Filter by employment type
    - **only_active**: Whether to show only active jobs
    - **page**: Page number for pagination
    - **size**: Number of items per page
    """
    jobs, total = await job_service.list_jobs(
        q=q,
        skills=skills,
        employment_type=employment_type,
        only_active=only_active,
        page=page,
        size=size,
    )
    
    job_responses = [JobResponse.from_orm(job) for job in jobs]
    
    return JobListResponse(
        items=job_responses,
        total=total,
        page=page,
        size=size,
    )


@router.get("/{job_id}", response_model=JobResponse, summary="Get job by ID")
async def get_job(
    job_id: uuid.UUID,
    job_service: JobService = Depends(get_job_service),
    user: Dict[str, Any] = Depends(require_org_member),
) -> JobResponse:
    """
    Get a specific job by its ID.
    
    - **job_id**: The UUID of the job to retrieve
    """
    job = await job_service.get_job(job_id)
    return JobResponse.from_orm(job)


@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED, summary="Create job")
async def create_job(
    job_data: JobCreateRequest,
    job_service: JobService = Depends(get_job_service),
    user: Dict[str, Any] = Depends(require_role("org:admin")),
) -> JobResponse:
    """
    Create a new job posting.
    
    Only organization admins can create jobs.
    The employer_id will be set to the current user's organization.
    """
    employer_id = job_data.employer_id or user.get("org_id")
    if not employer_id:
        raise ValueError("Employer ID is required")
    
    job = await job_service.create_job(
        employer_id=employer_id,
        title=job_data.title,
        description=job_data.description,
        location=job_data.location,
        employment_type=job_data.employment_type,
        skills=job_data.skills,
        is_active=job_data.is_active,
    )
    
    return JobResponse.from_orm(job)


@router.patch("/{job_id}", response_model=JobResponse, summary="Update job")
async def update_job(
    job_id: uuid.UUID,
    job_update: JobUpdateRequest,
    job_service: JobService = Depends(get_job_service),
    user: Dict[str, Any] = Depends(require_role("org:admin")),
) -> JobResponse:
    """
    Update an existing job posting.
    
    Only organization admins can update jobs.
    Only fields provided in the request will be updated.
    """
    update_data = job_update.dict(exclude_unset=True, exclude_none=True)
    
    if not update_data:
        job = await job_service.get_job(job_id)
        return JobResponse.from_orm(job)
    
    job = await job_service.update_job(job_id, **update_data)
    return JobResponse.from_orm(job)


@router.delete("/{job_id}", summary="Delete/deactivate job")
async def delete_job(
    job_id: uuid.UUID,
    job_service: JobService = Depends(get_job_service),
    user: Dict[str, Any] = Depends(require_role("org:admin")),
) -> JSONResponse:
    """
    Delete (deactivate) a job posting.
    
    Only organization admins can delete jobs.
    This performs a soft delete by setting is_active to False.
    """
    await job_service.deactivate_job(job_id)
    
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"message": "Job deactivated successfully", "job_id": str(job_id)},
    )


@router.get("/{job_id}/candidates", summary="Get matched candidates for a job")
async def get_matched_candidates(
    job_id: uuid.UUID,
    job_service: JobService = Depends(get_job_service),
    user: Dict[str, Any] = Depends(require_role("org:admin")),
) -> Dict[str, Any]:
    """
    Get candidates that match the requirements for a specific job.
    
    Only organization admins can view matched candidates.
    """
    job = await job_service.get_job(job_id)
    
    return {
        "job_id": str(job_id),
        "job_title": job.title,
        "candidates": [],
        "message": "Candidate matching functionality coming soon",
    }
