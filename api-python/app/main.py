from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.error_handlers import setup_exception_handlers
from app.routes import health, auth, candidates, applications, analytics, jobs, resumes
from app.routes.ranking import router as ranking_router
from app.routes.ai_alias import router as ai_router
from app.routes.starred_jobs import router as starred_jobs_router
from app.routes.users import router as users_router


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="Job Portal Python API")
    setup_exception_handlers(app)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_list or ["*"],
        allow_credentials=True,
        allow_methods=["*"],   # allow POST, GET, etc. (used by preflight)
        allow_headers=["*"],   # allow content-type, authorization, etc.
        expose_headers=["*"],
    )

    # Routers
    app.include_router(health.router, prefix="/health")
    app.include_router(auth.router, prefix="/auth")
    app.include_router(jobs.router, prefix="/v1/jobs")
    app.include_router(applications.router, prefix="/v1/applications")
    app.include_router(candidates.router, prefix="/v1/candidates")
    app.include_router(analytics.router, prefix="/v1/analytics")
    app.include_router(ranking_router, prefix="/v1")
    app.include_router(ai_router, prefix="/ai")
    app.include_router(resumes.router, prefix="/v1/resumes")
    app.include_router(starred_jobs_router, prefix="/v1/users/me")
    app.include_router(users_router, prefix="/v1/users", tags=["users"])

    return app


# Exported for `uvicorn app.main:app` and for tests that import create_app
app = create_app()
