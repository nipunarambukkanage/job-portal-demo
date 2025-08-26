from __future__ import annotations

import uuid
from typing import Iterable, List, Optional, Tuple

from sqlalchemy import Select, func, select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.resume import Resume, ParseStatus


async def create_resume(
    session: AsyncSession,
    *,
    user_id: uuid.UUID,
    file_name: str,
    mime_type: str,
    size_bytes: int,
    blob_url: str,
) -> Resume:
    obj = Resume(
        user_id=user_id,
        file_name=file_name,
        mime_type=mime_type,
        size_bytes=size_bytes,
        blob_url=blob_url,
        parse_status=ParseStatus.pending,
    )
    session.add(obj)
    await session.flush()
    return obj


async def get_resume(session: AsyncSession, resume_id: uuid.UUID) -> Optional[Resume]:
    q: Select[tuple[Resume]] = select(Resume).where(Resume.id == resume_id)
    res = await session.execute(q)
    return res.scalar_one_or_none()


async def list_user_resumes(
    session: AsyncSession,
    *,
    user_id: uuid.UUID,
    page: int = 1,
    size: int = 20,
) -> Tuple[List[Resume], int]:
    page = max(1, page)
    size = max(1, min(200, size))
    base = select(Resume).where(Resume.user_id == user_id).order_by(Resume.uploaded_at.desc())
    total_q = select(func.count()).select_from(Resume).where(Resume.user_id == user_id)
    total = (await session.execute(total_q)).scalar_one()
    items = (await session.execute(base.offset((page - 1) * size).limit(size))).scalars().all()
    return items, total


async def set_resume_parse_status(
    session: AsyncSession,
    *,
    resume_id: uuid.UUID,
    status: ParseStatus,
    parse_error: Optional[str] = None,
) -> int:
    q = (
        update(Resume)
        .where(Resume.id == resume_id)
        .values(parse_status=status, parse_error=parse_error)
    )
    res = await session.execute(q)
    # No flush needed for bulk; caller's transaction will commit
    return res.rowcount or 0


async def save_resume_raw_docintel(
    session: AsyncSession,
    *,
    resume_id: uuid.UUID,
    raw_json: dict,
) -> int:
    q = update(Resume).where(Resume.id == resume_id).values(raw_docintel=raw_json)
    res = await session.execute(q)
    return res.rowcount or 0


async def delete_resume(session: AsyncSession, resume_id: uuid.UUID) -> int:
    q = delete(Resume).where(Resume.id == resume_id)
    res = await session.execute(q)
    return res.rowcount or 0
