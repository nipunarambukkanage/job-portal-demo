from __future__ import annotations

import uuid
from typing import List, Optional, Tuple

from sqlalchemy import Select, func, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.application import Application, ApplicationStatus


async def create_application(
    session: AsyncSession,
    *,
    job_id: uuid.UUID,
    candidate_id: uuid.UUID,
    resume_id: uuid.UUID | None = None,
    cover_letter: str | None = None,
) -> Application:
    """
    Creates an Application. Unique (candidate_id, job_id) is enforced by DB;
    IntegrityError will be raised if user already applied.
    """
    obj = Application(
        job_id=job_id,
        candidate_id=candidate_id,
        resume_id=resume_id,
        cover_letter=cover_letter,
        status=ApplicationStatus.submitted,
    )
    session.add(obj)
    try:
        await session.flush()
    except IntegrityError as ex:
        raise ValueError("Candidate has already applied to this job") from ex
    return obj


async def get_application(session: AsyncSession, application_id: uuid.UUID) -> Optional[Application]:
    q: Select[tuple[Application]] = select(Application).where(Application.id == application_id)
    res = await session.execute(q)
    return res.scalar_one_or_none()


async def list_applications_by_job(
    session: AsyncSession,
    *,
    job_id: uuid.UUID,
    page: int = 1,
    size: int = 20,
) -> Tuple[List[Application], int]:
    page = max(1, page)
    size = max(1, min(200, size))
    base = select(Application).where(Application.job_id == job_id).order_by(Application.applied_at.desc())
    count_q = select(func.count()).select_from(Application).where(Application.job_id == job_id)
    total = (await session.execute(count_q)).scalar_one()
    items = (await session.execute(base.offset((page - 1) * size).limit(size))).scalars().all()
    return items, total


async def list_applications_by_candidate(
    session: AsyncSession,
    *,
    candidate_id: uuid.UUID,
    page: int = 1,
    size: int = 20,
) -> Tuple[List[Application], int]:
    page = max(1, page)
    size = max(1, min(200, size))
    base = select(Application).where(Application.candidate_id == candidate_id).order_by(Application.applied_at.desc())
    count_q = select(func.count()).select_from(Application).where(Application.candidate_id == candidate_id)
    total = (await session.execute(count_q)).scalar_one()
    items = (await session.execute(base.offset((page - 1) * size).limit(size))).scalars().all()
    return items, total


async def update_application_status(
    session: AsyncSession,
    *,
    application_id: uuid.UUID,
    status: ApplicationStatus,
) -> int:
    q = update(Application).where(Application.id == application_id).values(status=status)
    res = await session.execute(q)
    return res.rowcount or 0
