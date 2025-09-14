"""
Job Service Layer

Encapsulates business logic for job operations, coordinating between
repositories and providing a clean interface for route handlers.
"""
from __future__ import annotations

import uuid
from typing import List, Optional, Tuple

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.job import Job, EmploymentType
from app.repositories import job_repo
from app.core.exceptions import JobNotFoundError, InvalidJobDataError


class JobService:
    """Service for job-related business operations."""
    
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def create_job(
        self,
        *,
        employer_id: uuid.UUID,
        title: str,
        description: str,
        location: str | None = None,
        employment_type: EmploymentType = EmploymentType.full_time,
        skills: list[str] | None = None,
        is_active: bool = True,
    ) -> Job:
        """
        Create a new job posting.
        
        Args:
            employer_id: UUID of the employer creating the job
            title: Job title (required)
            description: Job description (required)
            location: Job location (optional)
            employment_type: Type of employment (default: full_time)
            skills: List of required skills (optional)
            is_active: Whether the job is active (default: True)
            
        Returns:
            Created Job instance
            
        Raises:
            InvalidJobDataError: If job data is invalid
        """
        # Validate required fields
        if not title or not title.strip():
            raise InvalidJobDataError("Job title is required")
        
        if not description or not description.strip():
            raise InvalidJobDataError("Job description is required")
        
        # Clean and validate data
        title = title.strip()
        description = description.strip()
        location = location.strip() if location else None
        skills = [skill.strip() for skill in (skills or []) if skill.strip()]
        
        try:
            job = await job_repo.create_job(
                self.session,
                employer_id=employer_id,
                title=title,
                description=description,
                location=location,
                employment_type=employment_type,
                skills=skills or None,
                is_active=is_active,
            )
            await self.session.flush()
            return job
        except Exception as e:
            raise InvalidJobDataError(f"Failed to create job: {str(e)}") from e
    
    async def get_job(self, job_id: uuid.UUID) -> Job:
        """
        Get a job by ID.
        
        Args:
            job_id: UUID of the job to retrieve
            
        Returns:
            Job instance
            
        Raises:
            JobNotFoundError: If job doesn't exist
        """
        job = await job_repo.get_job(self.session, job_id)
        if not job:
            raise JobNotFoundError(f"Job with ID {job_id} not found")
        return job
    
    async def list_jobs(
        self,
        *,
        q: str | None = None,
        skills: list[str] | None = None,
        employment_type: EmploymentType | None = None,
        only_active: bool = True,
        page: int = 1,
        size: int = 20,
    ) -> Tuple[List[Job], int]:
        """
        List jobs with filtering and pagination.
        
        Args:
            q: Search query for title, description, or location
            skills: Filter by required skills
            employment_type: Filter by employment type
            only_active: Whether to only show active jobs
            page: Page number (1-based)
            size: Page size (1-200)
            
        Returns:
            Tuple of (jobs list, total count)
        """
        # Validate and sanitize pagination
        page = max(1, page)
        size = max(1, min(200, size))
        
        # Clean search query
        q = q.strip() if q else None
        
        # Clean skills filter
        skills = [skill.strip() for skill in (skills or []) if skill.strip()] or None
        
        return await job_repo.list_jobs(
            self.session,
            q=q,
            skills=skills,
            employment_type=employment_type,
            only_active=only_active,
            page=page,
            size=size,
        )
    
    async def update_job(
        self,
        job_id: uuid.UUID,
        *,
        title: str | None = None,
        description: str | None = None,
        location: str | None = None,
        employment_type: EmploymentType | None = None,
        skills: list[str] | None = None,
        is_active: bool | None = None,
    ) -> Job:
        """
        Update an existing job.
        
        Args:
            job_id: UUID of the job to update
            title: New job title
            description: New job description
            location: New job location
            employment_type: New employment type
            skills: New skills list
            is_active: New active status
            
        Returns:
            Updated Job instance
            
        Raises:
            JobNotFoundError: If job doesn't exist
            InvalidJobDataError: If update data is invalid
        """
        # First check if job exists
        job = await self.get_job(job_id)
        
        # Validate and clean data
        update_data = {}
        
        if title is not None:
            title = title.strip()
            if not title:
                raise InvalidJobDataError("Job title cannot be empty")
            update_data["title"] = title
        
        if description is not None:
            description = description.strip()
            if not description:
                raise InvalidJobDataError("Job description cannot be empty")
            update_data["description"] = description
        
        if location is not None:
            update_data["location"] = location.strip() if location else None
        
        if employment_type is not None:
            update_data["employment_type"] = employment_type
        
        if skills is not None:
            cleaned_skills = [skill.strip() for skill in skills if skill.strip()]
            update_data["skills"] = cleaned_skills or None
        
        if is_active is not None:
            update_data["is_active"] = is_active
        
        if not update_data:
            return job  # No changes to make
        
        try:
            rows_affected = await job_repo.update_job(self.session, job_id=job_id, **update_data)
            if rows_affected == 0:
                raise JobNotFoundError(f"Job with ID {job_id} not found")
            
            await self.session.flush()
            # Return the updated job
            return await self.get_job(job_id)
        except JobNotFoundError:
            raise
        except Exception as e:
            raise InvalidJobDataError(f"Failed to update job: {str(e)}") from e
    
    async def deactivate_job(self, job_id: uuid.UUID) -> Job:
        """
        Deactivate a job (soft delete).
        
        Args:
            job_id: UUID of the job to deactivate
            
        Returns:
            Deactivated Job instance
            
        Raises:
            JobNotFoundError: If job doesn't exist
        """
        # First check if job exists
        job = await self.get_job(job_id)
        
        rows_affected = await job_repo.deactivate_job(self.session, job_id)
        if rows_affected == 0:
            raise JobNotFoundError(f"Job with ID {job_id} not found")
        
        await self.session.flush()
        return await self.get_job(job_id)
    
    async def delete_job(self, job_id: uuid.UUID) -> bool:
        """
        Delete a job permanently.
        
        Args:
            job_id: UUID of the job to delete
            
        Returns:
            True if job was deleted
            
        Raises:
            JobNotFoundError: If job doesn't exist
        """
        # For now, just deactivate (implement hard delete if needed)
        await self.deactivate_job(job_id)
        return True
