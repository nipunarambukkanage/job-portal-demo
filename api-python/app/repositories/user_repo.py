from __future__ import annotations

import uuid
from typing import Any, Dict, List, Optional, Tuple

from sqlalchemy import select, func, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import Select

from app.models.user import User, UserRole


async def create_user(
    session: AsyncSession,
    *,
    email: str,
    full_name: Optional[str] = None,
    role: UserRole = UserRole.candidate,
    headline: Optional[str] = None,
    about: Optional[str] = None,
    id_override: Optional[uuid.UUID] = None,   # <-- NEW (backward compatible)
) -> User:
    user = User(
        id=id_override or None,  # let DB default run if None
        email=email,
        full_name=full_name,
        role=role,
        headline=headline,
        about=about,
    )
    session.add(user)
    await session.flush()  # populate id/timestamps
    return user


async def ensure_user(
    session: AsyncSession,
    *,
    email: str,
    defaults: Optional[Dict[str, Any]] = None,
    id_override: Optional[uuid.UUID] = None,   # <-- NEW passthrough only when creating
) -> User:
    """
    Get-or-create by email. If user exists and defaults has fields, update only
    the provided non-None fields.
    """
    existing = await get_user_by_email(session, email)
    if existing:
        updated = False
        if defaults:
            for k, v in defaults.items():
                if v is not None and hasattr(existing, k) and getattr(existing, k) != v:
                    setattr(existing, k, v)
                    updated = True
        if updated:
            await session.flush()
        return existing

    defaults = defaults or {}
    return await create_user(
        session,
        email=email,
        full_name=defaults.get("full_name"),
        role=defaults.get("role", UserRole.candidate),
        headline=defaults.get("headline"),
        about=defaults.get("about"),
        id_override=id_override,  # <-- used only when creating new
    )


async def get_user(session: AsyncSession, user_id: uuid.UUID) -> Optional[User]:
    q: Select[tuple[User]] = select(User).where(User.id == user_id)
    res = await session.execute(q)
    return res.scalar_one_or_none()


# Alias to satisfy routers that import get_user_by_id
async def get_user_by_id(session: AsyncSession, user_id: uuid.UUID) -> Optional[User]:
    return await get_user(session, user_id)


async def get_user_by_email(session: AsyncSession, email: str) -> Optional[User]:
    q: Select[tuple[User]] = select(User).where(User.email == email)
    res = await session.execute(q)
    return res.scalar_one_or_none()


async def list_users(
    session: AsyncSession,
    *,
    page: int = 1,
    size: int = 50,
) -> Tuple[List[User], int]:
    page = max(1, page)
    size = max(1, min(200, size))

    total = (await session.execute(select(func.count()).select_from(User))).scalar_one()

    q = (
        select(User)
        .order_by(User.created_at.desc())
        .offset((page - 1) * size)
        .limit(size)
    )
    items = (await session.execute(q)).scalars().all()
    return items, total


async def update_user(
    session: AsyncSession,
    *,
    user_id: uuid.UUID,
    full_name: Optional[str] = None,
    role: Optional[UserRole] = None,
    headline: Optional[str] = None,
    about: Optional[str] = None,
) -> Optional[User]:
    values: dict = {}
    if full_name is not None:
        values["full_name"] = full_name
    if role is not None:
        values["role"] = role
    if headline is not None:
        values["headline"] = headline
    if about is not None:
        values["about"] = about

    if values:
        await session.execute(update(User).where(User.id == user_id).values(**values))
        await session.flush()

    return await get_user(session, user_id)


async def delete_user(session: AsyncSession, user_id: uuid.UUID) -> int:
    res = await session.execute(delete(User).where(User.id == user_id))
    return res.rowcount or 0
