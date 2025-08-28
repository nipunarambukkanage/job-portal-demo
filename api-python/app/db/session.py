from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from app.core.config import get_settings

_engine: AsyncEngine | None = None
_Session: async_sessionmaker[AsyncSession] | None = None


def get_engine() -> AsyncEngine:
    global _engine, _Session
    if _engine is None:
        cfg = get_settings()
        _engine = create_async_engine(
            cfg.DATABASE_URL,
            echo=False,
            pool_pre_ping=True,
            poolclass=NullPool,
        )
        _Session = async_sessionmaker(bind=_engine, expire_on_commit=False, class_=AsyncSession)
    return _engine


def get_sessionmaker() -> async_sessionmaker[AsyncSession]:
    global _Session
    if _Session is None:
        get_engine()
    assert _Session is not None
    return _Session


@asynccontextmanager
async def async_session() -> AsyncGenerator[AsyncSession, None]:
    maker = get_sessionmaker()
    session = maker()
    try:
        yield session
        await session.commit()
    except Exception:
        await session.rollback()
        raise
    finally:
        await session.close()


async def ping() -> bool:
    """
    Lightweight DB connectivity check for readiness probes.
    """
    async with async_session() as s:
        result = await s.execute("SELECT 1")
        _ = result.scalar()
        return _ == 1
