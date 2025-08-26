from __future__ import annotations

import uuid
from typing import Optional

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import func

from app.models.resume_features import ResumeFeatures


async def get_resume_features(session: AsyncSession, resume_id: uuid.UUID) -> Optional[ResumeFeatures]:
    q = select(ResumeFeatures).where(ResumeFeatures.resume_id == resume_id)
    res = await session.execute(q)
    return res.scalar_one_or_none()


async def upsert_resume_features(
    session: AsyncSession,
    *,
    resume_id: uuid.UUID,
    full_name: str | None = None,
    email: str | None = None,
    phone: str | None = None,
    summary: str | None = None,
    skills: list[str] | None = None,
    languages: list[str] | None = None,
    education: dict | None = None,
    experience: dict | None = None,
    certifications: dict | None = None,
    total_experience_months: int | None = None,
) -> None:
    """
    Postgres-native upsert (INSERT ... ON CONFLICT DO UPDATE) on primary key = resume_id.
    """
    stmt = pg_insert(ResumeFeatures).values(
        resume_id=resume_id,
        full_name=full_name,
        email=email,
        phone=phone,
        summary=summary,
        skills=skills,
        languages=languages,
        education=education,
        experience=experience,
        certifications=certifications,
        total_experience_months=total_experience_months,
        updated_at=func.now(),
    )
    update_cols = {
        "full_name": stmt.excluded.full_name,
        "email": stmt.excluded.email,
        "phone": stmt.excluded.phone,
        "summary": stmt.excluded.summary,
        "skills": stmt.excluded.skills,
        "languages": stmt.excluded.languages,
        "education": stmt.excluded.education,
        "experience": stmt.excluded.experience,
        "certifications": stmt.excluded.certifications,
        "total_experience_months": stmt.excluded.total_experience_months,
        "updated_at": func.now(),
    }
    stmt = stmt.on_conflict_do_update(index_elements=[ResumeFeatures.resume_id], set_=update_cols)
    await session.execute(stmt)
    # Caller manages commit via session context
