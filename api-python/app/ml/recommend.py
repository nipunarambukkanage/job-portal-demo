from __future__ import annotations

from typing import Dict, List, Tuple
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.job import Job
from app.models.resume_features import ResumeFeatures
from app.ml.embeddings import embed_texts, cosine_similarity


def _resume_text(f: ResumeFeatures) -> str:
    parts: list[str] = []
    if f.full_name:
        parts.append(f.full_name)
    if f.summary:
        parts.append(f.summary)
    if f.skills:
        parts.append(" ".join(f.skills))
    if f.languages:
        parts.append(" ".join(f.languages))
    if f.experience:
        items = (f.experience.get("items") or []) if isinstance(f.experience, dict) else []
        for it in items:
            title = (it.get("title") or "") if isinstance(it, dict) else ""
            desc = (it.get("description") or "") if isinstance(it, dict) else ""
            parts.append(f"{title} {desc}".strip())
    if f.education:
        items = (f.education.get("items") or []) if isinstance(f.education, dict) else []
        for it in items:
            deg = (it.get("degree") or "") if isinstance(it, dict) else ""
            fld = (it.get("field_of_study") or "") if isinstance(it, dict) else ""
            parts.append(f"{deg} {fld}".strip())
    return " ".join(x for x in parts if x)


def _job_text(j: Job) -> str:
    parts: list[str] = [j.title or "", j.description or ""]
    if j.location:
        parts.append(j.location)
    if j.skills:
        parts.append(" ".join(j.skills))
    return " ".join(x for x in parts if x)


async def recommend_jobs_for_resume(
    session: AsyncSession,
    *,
    resume_id: "uuid.UUID",
    top_k: int = 10,
) -> List[Dict]:
    """
    Embed candidate features vs. active jobs and rank by cosine similarity.
    """
    f = (await session.execute(
        select(ResumeFeatures).where(ResumeFeatures.resume_id == resume_id)
    )).scalar_one_or_none()
    if not f:
        return []

    jobs = (await session.execute(
        select(Job).where(Job.is_active.is_(True)).order_by(Job.posted_at.desc()).limit(500)
    )).scalars().all()

    cand_vec = embed_texts([_resume_text(f)], dims=512)[0]
    job_texts = [_job_text(j) for j in jobs]
    job_vecs = embed_texts(job_texts, dims=512)

    scored: list[tuple[float, Job]] = []
    for j, v in zip(jobs, job_vecs):
        s = cosine_similarity(cand_vec, v)
        if s > 0:
            scored.append((s, j))

    scored.sort(key=lambda x: x[0], reverse=True)
    out = [
        {
            "job_id": str(j.id),
            "title": j.title,
            "location": j.location,
            "employment_type": j.employment_type.value,
            "score": float(round(s, 6)),
        }
        for s, j in scored[:max(1, top_k)]
    ]
    return out


async def recommend_resumes_for_job(
    session: AsyncSession,
    *,
    job_id: "uuid.UUID",
    top_k: int = 10,
) -> List[Dict]:
    """
    Embed job posting vs. recent candidate features and rank by cosine similarity.
    """
    j = (await session.execute(
        select(Job).where(Job.id == job_id)
    )).scalar_one_or_none()
    if not j:
        return []

    feats = (await session.execute(
        select(ResumeFeatures).order_by(ResumeFeatures.updated_at.desc()).limit(1000)
    )).scalars().all()

    job_vec = embed_texts([_job_text(j)], dims=512)[0]
    res_texts = [_resume_text(f) for f in feats]
    res_vecs = embed_texts(res_texts, dims=512)

    scored: list[tuple[float, ResumeFeatures]] = []
    for f, v in zip(feats, res_vecs):
        s = cosine_similarity(job_vec, v)
        if s > 0:
            scored.append((s, f))

    scored.sort(key=lambda x: x[0], reverse=True)
    out = [
        {
            "resume_id": str(f.resume_id),
            "full_name": f.full_name,
            "score": float(round(s, 6)),
        }
        for s, f in scored[:max(1, top_k)]
    ]
    return out
