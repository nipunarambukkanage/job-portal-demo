# Explicitly re-export route modules so "from app.routes import X" is reliable.
from . import health, auth, candidates, applications, analytics, jobs, resumes  # noqa: F401
from .ranking import router as ranking_router  # noqa: F401
from .ai_alias import router as ai_router  # noqa: F401
from .starred_jobs import router as starred_jobs_router  # noqa: F401

__all__ = [
    "health",
    "auth",
    "candidates",
    "applications",
    "analytics",
    "jobs",
    "resumes",
    "ranking_router",
    "ai_router",
    "starred_jobs_router",
]
