from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.db import get_session
from app.core.security import get_current_user
from app.core.authz import require_role
from app.models.starred_and_keywords import JobKeywords
from app.models.application import Application  # assuming exists mapping job_id -> resume_id
from app.models.resume_features import ResumeFeatures
from app.services.ranking import jaccard

router = APIRouter()

@router.post("/v1/jobs/{job_id}/rank-resumes")
async def rank_resumes(job_id: str, body: dict | None = None, user=Depends(require_role("admin")),
                       db: AsyncSession = Depends(get_session)):
    # Keywords precedence: request.body.keywords -> saved pyapi.job_keywords -> []
    req_keywords = [k for k in (body or {}).get("keywords", []) if isinstance(k, str)]
    if req_keywords:
        kw = req_keywords
    else:
        r = await db.execute(select(JobKeywords).where(JobKeywords.job_id == job_id))  # type: ignore
        row = r.scalar_one_or_none()
        kw = (row.keywords if row else []) if row else []

    if not kw:
        raise HTTPException(status_code=400, detail="No keywords provided or saved for this job")

    # collect resumes applied to this job
    apps = (await db.execute(select(Application).where(Application.job_id == job_id))).scalars().all()  # type: ignore
    if not apps:
        return {"jobId": job_id, "rankings": []}

    # join to resume_features (assumed skills: list[str] field)
    resume_ids = [a.resume_id for a in apps if getattr(a, "resume_id", None)]
    feats = (await db.execute(select(ResumeFeatures).where(ResumeFeatures.resume_id.in_(resume_ids)))).scalars().all()

    scored = []
    for f in feats:
        skills = getattr(f, "skills", []) or []
        score = jaccard(kw, skills)
        scored.append({
            "resumeId": str(f.resume_id),
            "score": round(score, 4),
            "matchedSkills": sorted(set([s for s in skills if s.lower() in {x.lower() for x in kw}])),
        })

    scored.sort(key=lambda x: x["score"], reverse=True)
    return {"jobId": job_id, "keywords": kw, "rankings": scored}
