from __future__ import annotations

import math
import re
from typing import Dict, Iterable, List, Sequence, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.job import Job
from app.models.resume_features import ResumeFeatures


def _norm_tag(s: str) -> str:
    return re.sub(r"[^a-z0-9+#]+", " ", s.strip().lower()).strip()


def score_skills_overlap(a: Sequence[str] | None, b: Sequence[str] | None) -> float:
    """
    Simple symmetric overlap score between two skill lists (0..1).
    """
    if not a or not b:
        return 0.0
    A = { _norm_tag(x) for x in a if x }
    B = { _norm_tag(x) for x in b if x }
    if not A or not B:
        return 0.0
    inter = len(A & B)
    denom = math.sqrt(len(A) * len(B))
    if denom == 0:
        return 0.0
    return round(inter / denom, 4)


async def match_jobs_for_candidate(
    session: AsyncSession,
    *,
    features: ResumeFeatures,
    limit: int = 20,
) -> List[Dict]:
    """
    Scores active jobs against a candidate's skills and returns ranked list with reasons.
    """
    q = select(Job).where(Job.is_active.is_(True)).order_by(Job.posted_at.desc()).limit(200)
    jobs = (await session.execute(q)).scalars().all()

    cand_skills = features.skills or []
    results: List[Tuple[float, Job, List[str]]] = []

    for job in jobs:
        s = score_skills_overlap(cand_skills, job.skills or [])
        reasons = []
        if s > 0:
            common = sorted(set(_norm_tag(x) for x in cand_skills) & set(_norm_tag(x) for x in (job.skills or [])))
            if common:
                reasons.append(f"Shared skills: {', '.join(common[:6])}")
        # location or type bonuses could be added here
        score = s
        if score > 0:
            results.append((score, job, reasons))

    results.sort(key=lambda x: x[0], reverse=True)
    out = [
        {
            "job_id": str(job.id),
            "title": job.title,
            "location": job.location,
            "employment_type": job.employment_type.value,
            "score": float(score),
            "reasons": reasons,
        }
        for (score, job, reasons) in results[:limit]
    ]
    return out


async def match_candidates_for_job(
    session: AsyncSession,
    *,
    job: Job,
    limit: int = 20,
) -> List[Dict]:
    """
    Scores candidates (by features) for a given job and returns ranked list.
    """
    q = select(ResumeFeatures).order_by(ResumeFeatures.updated_at.desc()).limit(500)
    feats = (await session.execute(q)).scalars().all()
    results: List[Tuple[float, ResumeFeatures, List[str]]] = []

    req_skills = job.skills or []
    for f in feats:
        s = score_skills_overlap(req_skills, f.skills or [])
        reasons = []
        if s > 0:
            common = sorted(set(_norm_tag(x) for x in req_skills) & set(_norm_tag(x) for x in (f.skills or [])))
            if common:
                reasons.append(f"Shared skills: {', '.join(common[:6])}")
        score = s
        if score > 0:
            results.append((score, f, reasons))

    results.sort(key=lambda x: x[0], reverse=True)
    out = [
        {
            "resume_id": str(f.resume_id),
            "full_name": f.full_name,
            "score": float(score),
            "reasons": reasons,
        }
        for (score, f, reasons) in results[:limit]
    ]
    return out
