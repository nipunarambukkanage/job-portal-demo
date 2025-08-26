from __future__ import annotations

from typing import AsyncGenerator, Dict, Any

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings, get_settings
from app.core.security import get_current_user
from app.db.session import async_session


def settings_dep() -> Settings:
    return get_settings()


async def db_session_dep() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session


async def current_user_dep(user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    return user
