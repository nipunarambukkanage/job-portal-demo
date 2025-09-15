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
    external_id: str,
    email: str,
    first_name: Optional[str] = None,
    last_name: Optional[str] = None,
    role: UserRole = UserRole.candidate,
    org_id: Optional[uuid.UUID] = None,
    id_override: Optional[uuid.UUID] = None,
) -> User:
    user = User(
        id=id_override or None,
        external_id=external_id,
        email=email,
        first_name=first_name,
        last_name=last_name,
        full_name=f"{first_name or ''} {last_name or ''}".strip() or None,
        role=role,
        org_id=org_id,
    )
    session.add(user)
    await session.flush()
    return user


async def get_user_by_external_id(session: AsyncSession, external_id: str) -> Optional[User]:
    q: Select[tuple[User]] = select(User).where(User.external_id == external_id)
    res = await session.execute(q)
    return res.scalar_one_or_none()


async def list_users_by_org(
    session: AsyncSession,
    org_id: uuid.UUID,
    *,
    role: Optional[UserRole] = None,
    page: int = 1,
    size: int = 20,
) -> Tuple[List[User], int]:
    page = max(1, page)
    size = max(1, min(100, size))

    base_query = select(User).where(User.org_id == org_id)
    count_query = select(func.count()).select_from(User).where(User.org_id == org_id)

    if role:
        base_query = base_query.where(User.role == role)
        count_query = count_query.where(User.role == role)

    total = (await session.execute(count_query)).scalar_one()
    
    items_query = base_query.order_by(User.created_at.desc()).offset((page - 1) * size).limit(size)
    items = (await session.execute(items_query)).scalars().all()
    
    return items, total


async def deactivate_user(session: AsyncSession, user_id: uuid.UUID) -> int:
    res = await session.execute(
        update(User).where(User.id == user_id).values(is_active=False)
    )
    return res.rowcount or 0


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
    email: Optional[str] = None,
    first_name: Optional[str] = None,
    last_name: Optional[str] = None,
    full_name: Optional[str] = None,
    role: Optional[UserRole] = None,
    org_id: Optional[uuid.UUID] = None,
    headline: Optional[str] = None,
    about: Optional[str] = None,
) -> int:
    values: dict = {}
    if email is not None:
        values["email"] = email
    if first_name is not None:
        values["first_name"] = first_name
    if last_name is not None:
        values["last_name"] = last_name
    if full_name is not None:
        values["full_name"] = full_name
    if role is not None:
        values["role"] = role
    if org_id is not None:
        values["org_id"] = org_id
    if headline is not None:
        values["headline"] = headline
    if about is not None:
        values["about"] = about

    if values:
        res = await session.execute(update(User).where(User.id == user_id).values(**values))
        await session.flush()
        return res.rowcount or 0
    
    return 0


async def delete_user(session: AsyncSession, user_id: uuid.UUID) -> int:
    res = await session.execute(delete(User).where(User.id == user_id))
    return res.rowcount or 0
