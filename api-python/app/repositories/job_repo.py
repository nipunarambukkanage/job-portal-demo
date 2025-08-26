from __future__ import annotations

import uuid
from typing import List, Optional, Tuple

from sqlalchemy import Select, and_, func, or_, select, update
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.job import Job, EmploymentType


async def create_job(
    session: AsyncSession,
    *,
    employer_id: uuid.UUID,
    title: str,
    description: str,
    location: str | None = None,
    employment_type: EmploymentType = EmploymentType.full_time,
    skills: list[str] | None = None,
    is_active: bool = True,
) -> Job:
    obj = Job(
        employer_id=employer_id,
        title=title,
        description=description,
        location=location,
        employment_type=employment_type,
        skills=skills,
        is_active=is_active,
    )
    session.add(obj)
    await session.flush()
    return obj


async def get_job(session: AsyncSession, job_id: uuid.UUID) -> Optional[Job]:
    q: Select[tuple[Job]] = select(Job).where(Job.id == job_id)
    res = await session.execute(q)
    return res.scalar_one_or_none()


def _job_filters(
    *,
    q: str | None,
    skills: list[str] | None,
    employment_type: EmploymentType | None,
    only_active: bool,
):
    conds = []
    if only_active:
        conds.append(Job.is_active.is_(True))
    if q:
        like = f"%{q}%"
        conds.append(or_(Job.title.ilike(like), Job.description.ilike(like), Job.location.ilike(like)))
    if employment_type:
        conds.append(Job.employment_type == employment_type)
    if skills:
        # Postgres array overlap: skills && :skills
        conds.append(Job.skills.op("&&")(skills))
    return and_(*conds) if conds else None


async def list_jobs(
    session: AsyncSession,
    *,
    q: str | None = None,
    skills: list[str] | None = None,
    employment_type: EmploymentType | None = None,
    only_active: bool = True,
    page: int = 1,
    size: int = 20,
) -> Tuple[List[Job], int]:
    page = max(1, page)
    size = max(1, min(200, size))
    filters = _job_filters(q=q, skills=skills, employment_type=employment_type, only_active=only_active)

    base = select(Job)
    count_sel = select(func.count()).select_from(Job)
    if filters is not None:
        base = base.where(filters)
        count_sel = count_sel.where(filters)

    base = base.order_by(Job.posted_at.desc())
    total = (await session.execute(count_sel)).scalar_one()
    items = (await session.execute(base.offset((page - 1) * size).limit(size))).scalars().all()
    return items, total


async def update_job(
    session: AsyncSession,
    *,
    job_id: uuid.UUID,
    title: str | None = None,
    description: str | None = None,
    location: str | None = None,
    employment_type: EmploymentType | None = None,
    skills: list[str] | None = None,
    is_active: bool | None = None,
) -> int:
    values = {}
    if title is not None:
        values["title"] = title
    if description is not None:
        values["description"] = description
    if location is not None:
        values["location"] = location
    if employment_type is not None:
        values["employment_type"] = employment_type
    if skills is not None:
        values["skills"] = skills
    if is_active is not None:
        values["is_active"] = is_active

    if not values:
        return 0

    q = update(Job).where(Job.id == job_id).values(**values)
    res = await session.execute(q)
    return res.rowcount or 0


async def deactivate_job(session: AsyncSession, job_id: uuid.UUID) -> int:
    q = update(Job).where(Job.id == job_id).values(is_active=False)
    res = await session.execute(q)
    return res.rowcount or 0
