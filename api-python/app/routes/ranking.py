from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
import asyncpg
import os

from app.routes.auth import get_current_user
from app.core.authz import require_role

router = APIRouter()

DB_DSN = os.getenv("PY_API_PG_DSN", "postgresql://postgres:postgres@localhost:5432/postgres")

async def _get_conn():
    return await asyncpg.connect(dsn=DB_DSN)

# Upsert ranking for all resumes for a job
@router.post("/jobs/{job_id}/rank", summary="Rank resumes for a job (admin)")
async def rank_resumes(job_id: str, user=Depends(require_role("org:admin"))):
    """
    Simple keyword-based ranker demo:
    - Reads job keywords from jobs table (or metadata), reads resume_features/resumes,
    - Writes to pyapi.resume_ranking (upsert on (job_id,resume_id)).
    """
    conn = await _get_conn()
    try:
        # get keywords for the job (demo: from a hypothetical table job_keywords or a column)
        kws_rec = await conn.fetchrow("select keywords from jobs where id = $1", job_id)
        if not kws_rec:
            raise HTTPException(404, "Job not found")
        keywords = (kws_rec["keywords"] or "").lower().split()

        resumes: List[asyncpg.Record] = await conn.fetch("""
            select r.id as resume_id, coalesce(r.text,'') as text
            from resumes r 
            join applications a on a.resume_id = r.id
            where a.job_id = $1
        """, job_id)

        results: list[dict[str, Any]] = []
        for rec in resumes:
            text = (rec["text"] or "").lower()
            score = sum(1 for kw in keywords if kw and kw in text)
            results.append({"resume_id": str(rec["resume_id"]), "score": float(score)})

            await conn.execute("""
                insert into pyapi.resume_ranking (job_id, resume_id, score)
                values ($1, $2, $3)
                on conflict (job_id, resume_id)
                do update set score = excluded.score, created_at = now()
            """, job_id, rec["resume_id"], score)

        return {"job_id": job_id, "ranked": results}
    finally:
        await conn.close()

@router.get("/jobs/{job_id}/rankings", summary="Get current rankings (admin)")
async def get_rankings(job_id: str, user=Depends(require_role("org:admin"))):
    conn = await _get_conn()
    try:
        rows = await conn.fetch("""
            select resume_id::text, score, created_at
            from pyapi.resume_ranking
            where job_id = $1
            order by score desc, created_at desc
        """, job_id)
        return {"job_id": job_id, "items": [dict(r) for r in rows]}
    finally:
        await conn.close()
