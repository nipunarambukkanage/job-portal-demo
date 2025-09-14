"""
Global Exception Handlers

Provides centralized exception handling for the FastAPI application,
converting application exceptions to appropriate HTTP responses.
"""
from __future__ import annotations

import logging
from typing import Any, Dict

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError

from app.core.exceptions import (
    JobPortalError,
    ValidationError,
    NotFoundError,
    AuthenticationError,
    AuthorizationError,
    BusinessLogicError,
    ExternalServiceError,
    DatabaseError,
)

logger = logging.getLogger(__name__)


def create_error_response(
    status_code: int,
    error_type: str,
    message: str,
    details: str | None = None,
    **extra_fields: Any,
) -> JSONResponse:
    """
    Create a standardized error response.
    
    Args:
        status_code: HTTP status code
        error_type: Type of error (for client handling)
        message: Human-readable error message
        details: Additional error details
        **extra_fields: Additional fields to include in response
        
    Returns:
        JSONResponse with standardized error format
    """
    content: Dict[str, Any] = {
        "error": {
            "type": error_type,
            "message": message,
        }
    }
    
    if details:
        content["error"]["details"] = details
    
    # Add any extra fields
    for key, value in extra_fields.items():
        content["error"][key] = value
    
    return JSONResponse(
        status_code=status_code,
        content=content,
    )


def setup_exception_handlers(app: FastAPI) -> None:
    """
    Set up exception handlers for the FastAPI application.
    
    Args:
        app: FastAPI application instance
    """
    
    @app.exception_handler(ValidationError)
    async def validation_error_handler(request: Request, exc: ValidationError) -> JSONResponse:
        """Handle validation errors."""
        logger.warning(f"Validation error: {exc.message}", extra={"details": exc.details})
        return create_error_response(
            status_code=status.HTTP_400_BAD_REQUEST,
            error_type="validation_error",
            message=exc.message,
            details=exc.details,
        )
    
    @app.exception_handler(NotFoundError)
    async def not_found_error_handler(request: Request, exc: NotFoundError) -> JSONResponse:
        """Handle not found errors."""
        logger.info(f"Resource not found: {exc.message}")
        return create_error_response(
            status_code=status.HTTP_404_NOT_FOUND,
            error_type="not_found",
            message=exc.message,
            details=exc.details,
        )
    
    @app.exception_handler(AuthenticationError)
    async def authentication_error_handler(request: Request, exc: AuthenticationError) -> JSONResponse:
        """Handle authentication errors."""
        logger.warning(f"Authentication error: {exc.message}")
        return create_error_response(
            status_code=status.HTTP_401_UNAUTHORIZED,
            error_type="authentication_error",
            message=exc.message,
            details=exc.details,
        )
    
    @app.exception_handler(AuthorizationError)
    async def authorization_error_handler(request: Request, exc: AuthorizationError) -> JSONResponse:
        """Handle authorization errors."""
        logger.warning(f"Authorization error: {exc.message}")
        return create_error_response(
            status_code=status.HTTP_403_FORBIDDEN,
            error_type="authorization_error",
            message=exc.message,
            details=exc.details,
        )
    
    @app.exception_handler(BusinessLogicError)
    async def business_logic_error_handler(request: Request, exc: BusinessLogicError) -> JSONResponse:
        """Handle business logic errors."""
        logger.warning(f"Business logic error: {exc.message}", extra={"details": exc.details})
        return create_error_response(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error_type="business_logic_error",
            message=exc.message,
            details=exc.details,
        )
    
    @app.exception_handler(ExternalServiceError)
    async def external_service_error_handler(request: Request, exc: ExternalServiceError) -> JSONResponse:
        """Handle external service errors."""
        logger.error(f"External service error: {exc.message}", extra={"details": exc.details})
        return create_error_response(
            status_code=status.HTTP_502_BAD_GATEWAY,
            error_type="external_service_error",
            message="External service unavailable",
            details="Please try again later",
        )
    
    @app.exception_handler(DatabaseError)
    async def database_error_handler(request: Request, exc: DatabaseError) -> JSONResponse:
        """Handle database errors."""
        logger.error(f"Database error: {exc.message}", extra={"details": exc.details})
        return create_error_response(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            error_type="database_error",
            message="Database service unavailable",
            details="Please try again later",
        )
    
    @app.exception_handler(SQLAlchemyError)
    async def sqlalchemy_error_handler(request: Request, exc: SQLAlchemyError) -> JSONResponse:
        """Handle SQLAlchemy errors."""
        logger.error(f"SQLAlchemy error: {str(exc)}", exc_info=True)
        return create_error_response(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            error_type="database_error",
            message="Database operation failed",
            details="Please try again later",
        )
    
    @app.exception_handler(RequestValidationError)
    async def request_validation_error_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        """Handle FastAPI request validation errors."""
        logger.warning(f"Request validation error: {exc.errors()}")
        
        # Format validation errors for better UX
        error_details = []
        for error in exc.errors():
            field = " -> ".join(str(loc) for loc in error["loc"])
            error_details.append(f"{field}: {error['msg']}")
        
        return create_error_response(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error_type="validation_error",
            message="Request validation failed",
            details="; ".join(error_details),
            validation_errors=exc.errors(),
        )
    
    @app.exception_handler(JobPortalError)
    async def generic_job_portal_error_handler(request: Request, exc: JobPortalError) -> JSONResponse:
        """Handle generic Job Portal errors."""
        logger.error(f"Unhandled Job Portal error: {exc.message}", extra={"details": exc.details})
        return create_error_response(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_type="internal_error",
            message="An internal error occurred",
            details="Please try again later",
        )
    
    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        """Handle any other unhandled exceptions."""
        logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
        return create_error_response(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_type="internal_error",
            message="An unexpected error occurred",
            details="Please try again later",
        )
