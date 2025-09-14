from __future__ import annotations


class JobPortalError(Exception):
    """Base exception class for all Job Portal errors."""
    
    def __init__(self, message: str, details: str | None = None):
        self.message = message
        self.details = details
        super().__init__(message)


class ValidationError(JobPortalError):
    """Raised when input validation fails."""
    pass


class NotFoundError(JobPortalError):
    """Raised when a requested resource is not found."""
    pass


class AuthenticationError(JobPortalError):
    """Raised when authentication fails."""
    pass


class AuthorizationError(JobPortalError):
    """Raised when user lacks permission for an operation."""
    pass


class BusinessLogicError(JobPortalError):
    """Raised when business rules are violated."""
    pass


class ExternalServiceError(JobPortalError):
    """Raised when external service calls fail."""
    pass


# Job-specific exceptions
class JobNotFoundError(NotFoundError):
    """Raised when a job is not found."""
    pass


class InvalidJobDataError(ValidationError):
    """Raised when job data is invalid."""
    pass


# User-specific exceptions
class UserNotFoundError(NotFoundError):
    """Raised when a user is not found."""
    pass


class InvalidUserDataError(ValidationError):
    """Raised when user data is invalid."""
    pass


class DuplicateUserError(BusinessLogicError):
    """Raised when trying to create a user that already exists."""
    pass


# Application-specific exceptions
class ApplicationNotFoundError(NotFoundError):
    """Raised when an application is not found."""
    pass


class InvalidApplicationDataError(ValidationError):
    """Raised when application data is invalid."""
    pass


class DuplicateApplicationError(BusinessLogicError):
    """Raised when user tries to apply to the same job twice."""
    pass


# Resume-specific exceptions
class ResumeNotFoundError(NotFoundError):
    """Raised when a resume is not found."""
    pass


class InvalidResumeDataError(ValidationError):
    """Raised when resume data is invalid."""
    pass


class ResumeParsingError(ExternalServiceError):
    """Raised when resume parsing fails."""
    pass


# Storage-specific exceptions
class StorageError(ExternalServiceError):
    """Raised when storage operations fail."""
    pass


class BlobNotFoundError(StorageError):
    """Raised when a blob is not found in storage."""
    pass


# Database-specific exceptions
class DatabaseError(JobPortalError):
    """Raised when database operations fail."""
    pass


class ConnectionError(DatabaseError):
    """Raised when database connection fails."""
    pass
