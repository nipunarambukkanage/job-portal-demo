from __future__ import annotations

import logging
from typing import Any, Dict, Type

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

log = logging.getLogger(__name__)


class APIError(RuntimeError):
    status_code = 400
    code = "bad_request"

    def __init__(self, message: str, *, extra: Dict[str, Any] | None = None) -> None:
        super().__init__(message)
        self.message = message
        self.extra = extra or {}


class BadRequestError(APIError):
    status_code = 400
    code = "bad_request"


class UnauthorizedError(APIError):
    status_code = 401
    code = "unauthorized"


class ForbiddenError(APIError):
    status_code = 403
    code = "forbidden"


class NotFoundError(APIError):
    status_code = 404
    code = "not_found"


class ConflictError(APIError):
    status_code = 409
    code = "conflict"


class RateLimitError(APIError):
    status_code = 429
    code = "rate_limited"


class ExternalServiceError(APIError):
    status_code = 502
    code = "external_service_error"


def _handler_for(exc_type: Type[APIError]):
    async def handler(_: Request, exc: APIError) -> JSONResponse:
        payload = {"error": {"code": exc_type.code, "message": exc.message}}
        if exc.extra:
            payload["error"]["details"] = exc.extra
        return JSONResponse(status_code=exc_type.status_code, content=payload)
    return handler


def _unhandled_handler(_: Request, exc: Exception) -> JSONResponse:
    log.exception("unhandled_exception")
    return JSONResponse(
        status_code=500,
        content={"error": {"code": "internal_error", "message": "An unexpected error occurred"}},
    )


def register_exception_handlers(app: FastAPI) -> None:
    """
    Registers JSON exception handlers for common API errors and a fallback 500 handler.
    """
    app.add_exception_handler(BadRequestError, _handler_for(BadRequestError))
    app.add_exception_handler(UnauthorizedError, _handler_for(UnauthorizedError))
    app.add_exception_handler(ForbiddenError, _handler_for(ForbiddenError))
    app.add_exception_handler(NotFoundError, _handler_for(NotFoundError))
    app.add_exception_handler(ConflictError, _handler_for(ConflictError))
    app.add_exception_handler(RateLimitError, _handler_for(RateLimitError))
    app.add_exception_handler(ExternalServiceError, _handler_for(ExternalServiceError))
    app.add_exception_handler(Exception, _unhandled_handler)
