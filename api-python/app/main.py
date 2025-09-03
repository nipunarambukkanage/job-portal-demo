from fastapi import FastAPI
from app.routes import health, auth, jobs, applications, candidates, analytics, resumes
from app.routes import starred_jobs, ranking

app = FastAPI(title="Job Portal Python API")
app.include_router(health.router, prefix="/health")
app.include_router(auth.router, prefix="/auth")
app.include_router(jobs.router, prefix="/v1/jobs")
app.include_router(applications.router, prefix="/v1/applications")
app.include_router(candidates.router, prefix="/v1/candidates")
app.include_router(analytics.router, prefix="/v1/analytics")
app.include_router(resumes.router, prefix="/v1/resumes")
app.include_router(starred_jobs.router)   # /v1/users/me/starred-jobs
app.include_router(ranking.router)        # /v1/jobs/{job_id}/rank-resumes
