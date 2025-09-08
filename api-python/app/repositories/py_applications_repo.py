from __future__ import annotations

import uuid
from typing import Optional

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def create_application_row(
    session: AsyncSession,
    *,
    job_id: uuid.UUID,
    applicant_user_id: str,
    resume_id: Optional[uuid.UUID] = None,
    status: str = "submitted",
) -> uuid.UUID:
    """
    Inserts into public.applications (your current table):
      id (uuid default), job_id (uuid), applicant_user_id (text), resume_id (uuid|null),
      status (text), created_at (now()).
    Returns created id.
    """
    sql = text(
        """
        INSERT INTO public.applications (job_id, applicant_user_id, resume_id, status)
        VALUES (:job_id, :applicant_user_id, :resume_id, :status)
        RETURNING id
        """
    )
    res = await session.execute(
        sql,
        {
            "job_id": job_id,
            "applicant_user_id": applicant_user_id,
            "resume_id": resume_id,
            "status": status,
        },
    )
    new_id = res.scalar_one()
    return new_id
