from fastapi import FastAPI
from app.routes import health, auth, candidates, applications, analytics, jobs
from app.routes.ranking import router as ranking_router
from app.routes.ai_alias import router as ai_router
from app.routes import health, auth, candidates, applications, analytics, jobs
from app.routes.ranking import router as ranking_router
from app.routes.ai_alias import router as ai_router

app = FastAPI(title="Job Portal Python API")
app.include_router(health.router, prefix="/health")
app.include_router(auth.router, prefix="/auth")
app.include_router(jobs.router, prefix="/v1/jobs")
app.include_router(applications.router, prefix="/v1/applications")
app.include_router(candidates.router, prefix="/v1/candidates")
app.include_router(analytics.router, prefix="/v1/analytics")
app.include_router(ranking_router, prefix="/v1")
app.include_router(ai_router, prefix="/ai"))
app.include_router(resumes.router, prefix="/v1/resumes")
app.include_router(starred_jobs.router)   # /v1/users/me/starred-jobs
app.include_router(ranking.router)        # /v1/jobs/{job_id}/rank-resumes

