from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import async_session
from app.core.security import get_current_user
from app.models.starred_and_keywords import UserStarredJob

router = APIRouter()

@router.get("/starred-jobs")
async def list_starred(user=Depends(get_current_user)):
    uid = user.get("sub")
    async with async_session() as db:
        res = await db.execute(select(UserStarredJob.job_id).where(UserStarredJob.user_clerk_id == uid))
        return {"jobIds": [str(r[0]) for r in res.all()]}

@router.post("/starred-jobs")
async def add_star(payload: dict, user=Depends(get_current_user)):
    job_id = (payload.get("jobId") or "").strip()
    if not job_id:
        raise HTTPException(status_code=400, detail="jobId required")
    uid = user.get("sub")
    
    async with async_session() as db:
        # upsert-ish (ignore dup)
        item = UserStarredJob(user_clerk_id=uid, job_id=job_id)
        try:
            db.add(item)
            await db.commit()
        except Exception:
            await db.rollback()
        return {"ok": True}

@router.delete("/starred-jobs/{job_id}")
async def remove_star(job_id: str, user=Depends(get_current_user)):
    uid = user.get("sub")
    async with async_session() as db:
        await db.execute(delete(UserStarredJob).where(UserStarredJob.user_clerk_id == uid, UserStarredJob.job_id == job_id))
        await db.commit()
        return {"ok": True}