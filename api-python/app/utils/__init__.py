from __future__ import annotations

from .pagination import clamp_page_size, to_page
from .exceptions import (
    NotFoundError,
    ConflictError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    RateLimitError,
    ExternalServiceError,
    register_exception_handlers,
)

__all__ = [
    # pagination
    "clamp_page_size",
    "to_page",
    # exceptions
    "NotFoundError",
    "ConflictError",
    "BadRequestError",
    "UnauthorizedError",
    "ForbiddenError",
    "RateLimitError",
    "ExternalServiceError",
    "register_exception_handlers",
]
