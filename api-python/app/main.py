from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.routes import health, auth, resumes, jobs, applications, candidates, analytics

def _get_cors_origins() -> list[str]:
    # Comma-separated env: CORS_ORIGINS="http://localhost:5173,https://jobportal971778.z29.web.core.windows.net,https://jobportal.nipunarambukkanage.dev"
    raw = os.getenv("CORS_ORIGINS", "")
    return [o.strip() for o in raw.split(",") if o.strip()]

def create_app() -> FastAPI:
    app = FastAPI(title="Job Portal Python API", version="1.0.0")

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=_get_cors_origins() or ["*"],  # tighten in prod
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Routers
    app.include_router(health.router, prefix="/health", tags=["health"])
    app.include_router(auth.router, prefix="/auth", tags=["auth"])
    app.include_router(resumes.router, prefix="/v1/resumes", tags=["resumes"])
    app.include_router(jobs.router, prefix="/v1/jobs", tags=["jobs"])
    app.include_router(applications.router, prefix="/v1/applications", tags=["applications"])
    app.include_router(candidates.router, prefix="/v1/candidates", tags=["candidates"])
    app.include_router(analytics.router, prefix="/v1/analytics", tags=["analytics"])
    return app

app = create_app()
