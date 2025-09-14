"""
Application Service Layer

Encapsulates business logic for job application operations, coordinating between
repositories and providing a clean interface for route handlers.
"""
from __future__ import annotations

import uuid
from typing import List, Optional, Tuple

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.application import Application, ApplicationStatus
from app.repositories import application_repo, job_repo, user_repo
from app.core.exceptions import (
    ApplicationNotFoundError,
    InvalidApplicationDataError,
    DuplicateApplicationError,
    JobNotFoundError,
    UserNotFoundError,
)


class ApplicationService:
    """Service for job application-related business operations."""
    
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def create_application(
        self,
        *,
        job_id: uuid.UUID,
        candidate_id: uuid.UUID,
        resume_id: uuid.UUID | None = None,
        cover_letter: str | None = None,
    ) -> Application:
        """
        Create a new job application.
        
        Args:
            job_id: UUID of the job being applied to
            candidate_id: UUID of the candidate applying
            resume_id: UUID of the resume being submitted
            cover_letter: Optional cover letter text
            
        Returns:
            Created Application instance
            
        Raises:
            JobNotFoundError: If job doesn't exist
            UserNotFoundError: If candidate doesn't exist
            DuplicateApplicationError: If candidate already applied to this job
            InvalidApplicationDataError: If application data is invalid
        """
        # Validate that job exists and is active
        job = await job_repo.get_job(self.session, job_id)
        if not job:
            raise JobNotFoundError(f"Job with ID {job_id} not found")
        
        if not job.is_active:
            raise InvalidApplicationDataError("Cannot apply to an inactive job")
        
        # Validate that candidate exists
        candidate = await user_repo.get_user(self.session, candidate_id)
        if not candidate:
            raise UserNotFoundError(f"Candidate with ID {candidate_id} not found")
        
        # Check for duplicate application
        existing_app = await application_repo.get_application_by_job_and_candidate(
            self.session, job_id, candidate_id
        )
        if existing_app:
            raise DuplicateApplicationError(
                f"Candidate {candidate_id} has already applied to job {job_id}"
            )
        
        # Clean cover letter
        cover_letter = cover_letter.strip() if cover_letter else None
        
        try:
            application = await application_repo.create_application(
                self.session,
                job_id=job_id,
                candidate_id=candidate_id,
                resume_id=resume_id,
                cover_letter=cover_letter,
            )
            await self.session.flush()
            return application
        except Exception as e:
            raise InvalidApplicationDataError(f"Failed to create application: {str(e)}") from e
    
    async def get_application(self, application_id: uuid.UUID) -> Application:
        """
        Get an application by ID.
        
        Args:
            application_id: UUID of the application to retrieve
            
        Returns:
            Application instance
            
        Raises:
            ApplicationNotFoundError: If application doesn't exist
        """
        application = await application_repo.get_application(self.session, application_id)
        if not application:
            raise ApplicationNotFoundError(f"Application with ID {application_id} not found")
        return application
    
    async def list_applications_by_job(
        self,
        job_id: uuid.UUID,
        *,
        status: ApplicationStatus | None = None,
        page: int = 1,
        size: int = 20,
    ) -> Tuple[List[Application], int]:
        """
        List applications for a specific job.
        
        Args:
            job_id: UUID of the job to get applications for
            status: Optional status filter
            page: Page number (1-based)
            size: Page size (1-100)
            
        Returns:
            Tuple of (applications list, total count)
            
        Raises:
            JobNotFoundError: If job doesn't exist
        """
        # Validate that job exists
        job = await job_repo.get_job(self.session, job_id)
        if not job:
            raise JobNotFoundError(f"Job with ID {job_id} not found")
        
        # Validate pagination
        page = max(1, page)
        size = max(1, min(100, size))
        
        return await application_repo.list_applications_by_job(
            self.session,
            job_id=job_id,
            status=status,
            page=page,
            size=size,
        )
    
    async def list_applications_by_candidate(
        self,
        candidate_id: uuid.UUID,
        *,
        status: ApplicationStatus | None = None,
        page: int = 1,
        size: int = 20,
    ) -> Tuple[List[Application], int]:
        """
        List applications by a specific candidate.
        
        Args:
            candidate_id: UUID of the candidate to get applications for
            status: Optional status filter
            page: Page number (1-based)
            size: Page size (1-100)
            
        Returns:
            Tuple of (applications list, total count)
            
        Raises:
            UserNotFoundError: If candidate doesn't exist
        """
        # Validate that candidate exists
        candidate = await user_repo.get_user(self.session, candidate_id)
        if not candidate:
            raise UserNotFoundError(f"Candidate with ID {candidate_id} not found")
        
        # Validate pagination
        page = max(1, page)
        size = max(1, min(100, size))
        
        return await application_repo.list_applications_by_candidate(
            self.session,
            candidate_id=candidate_id,
            status=status,
            page=page,
            size=size,
        )
    
    async def update_application_status(
        self,
        application_id: uuid.UUID,
        new_status: ApplicationStatus,
        *,
        notes: str | None = None,
    ) -> Application:
        """
        Update the status of an application.
        
        Args:
            application_id: UUID of the application to update
            new_status: New application status
            notes: Optional notes about the status change
            
        Returns:
            Updated Application instance
            
        Raises:
            ApplicationNotFoundError: If application doesn't exist
            InvalidApplicationDataError: If status transition is invalid
        """
        # First check if application exists
        application = await self.get_application(application_id)
        
        # Validate status transition
        if not self._is_valid_status_transition(application.status, new_status):
            raise InvalidApplicationDataError(
                f"Invalid status transition from {application.status} to {new_status}"
            )
        
        # Clean notes
        notes = notes.strip() if notes else None
        
        try:
            rows_affected = await application_repo.update_application_status(
                self.session,
                application_id=application_id,
                status=new_status,
                notes=notes,
            )
            if rows_affected == 0:
                raise ApplicationNotFoundError(f"Application with ID {application_id} not found")
            
            await self.session.flush()
            return await self.get_application(application_id)
        except ApplicationNotFoundError:
            raise
        except Exception as e:
            raise InvalidApplicationDataError(f"Failed to update application status: {str(e)}") from e
    
    async def withdraw_application(self, application_id: uuid.UUID, candidate_id: uuid.UUID) -> Application:
        """
        Withdraw an application (candidate action).
        
        Args:
            application_id: UUID of the application to withdraw
            candidate_id: UUID of the candidate withdrawing (for authorization)
            
        Returns:
            Withdrawn Application instance
            
        Raises:
            ApplicationNotFoundError: If application doesn't exist
            InvalidApplicationDataError: If candidate doesn't own application or can't withdraw
        """
        application = await self.get_application(application_id)
        
        # Verify ownership
        if application.candidate_id != candidate_id:
            raise InvalidApplicationDataError("You can only withdraw your own applications")
        
        # Check if withdrawal is allowed
        if application.status in [ApplicationStatus.withdrawn, ApplicationStatus.rejected]:
            raise InvalidApplicationDataError(f"Cannot withdraw application with status: {application.status}")
        
        return await self.update_application_status(
            application_id,
            ApplicationStatus.withdrawn,
            notes="Withdrawn by candidate"
        )
    
    def _is_valid_status_transition(self, current_status: ApplicationStatus, new_status: ApplicationStatus) -> bool:
        """
        Check if a status transition is valid.
        
        Args:
            current_status: Current application status
            new_status: Desired new status
            
        Returns:
            True if transition is valid, False otherwise
        """
        # Define valid transitions
        valid_transitions = {
            ApplicationStatus.submitted: [
                ApplicationStatus.under_review,
                ApplicationStatus.rejected,
                ApplicationStatus.withdrawn,
            ],
            ApplicationStatus.under_review: [
                ApplicationStatus.interview_scheduled,
                ApplicationStatus.rejected,
                ApplicationStatus.withdrawn,
            ],
            ApplicationStatus.interview_scheduled: [
                ApplicationStatus.interview_completed,
                ApplicationStatus.rejected,
                ApplicationStatus.withdrawn,
            ],
            ApplicationStatus.interview_completed: [
                ApplicationStatus.offered,
                ApplicationStatus.rejected,
                ApplicationStatus.withdrawn,
            ],
            ApplicationStatus.offered: [
                ApplicationStatus.accepted,
                ApplicationStatus.rejected,
                ApplicationStatus.withdrawn,
            ],
            ApplicationStatus.accepted: [],  # Final state
            ApplicationStatus.rejected: [],  # Final state
            ApplicationStatus.withdrawn: [],  # Final state
        }
        
        return new_status in valid_transitions.get(current_status, [])
