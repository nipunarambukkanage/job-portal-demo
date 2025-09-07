from __future__ import annotations

import os
import ssl
from pathlib import Path
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.pool import NullPool

from app.core.config import get_settings

_engine: AsyncEngine | None = None
_Session: async_sessionmaker[AsyncSession] | None = None


def _ca_file_path() -> Path:
    """
    Resolve the CA certificate path.

    Priority:
      1) PGSSLROOTCERT env var (requested)
      2) PG_SSL_CA_FILE env var (custom)
      3) do-db-ca.crt in the same directory as this file (session.py)
    """
    for key in ("PGSSLROOTCERT", "PG_SSL_CA_FILE"):
        val = os.getenv(key)
        if val:
            p = Path(val)
            if p.exists():
                return p
    # fall back to a CA file sitting next to this module
    return Path(__file__).resolve().with_name("do-db-ca.crt")


def _needs_ssl(url: str) -> bool:
    u = (url or "").lower()
    return ("sslmode=require" in u) or ("ondigitalocean.com" in u) or (":25060" in u)


def _create_ssl_context() -> ssl.SSLContext:
    """Create SSL context (e.g., for DigitalOcean PostgreSQL)."""
    ssl_context = ssl.create_default_context()
    ca_path = _ca_file_path()
    try:
        if ca_path.exists():
            ssl_context.load_verify_locations(cafile=str(ca_path))
        else:
            # Fall back to system trust store
            print(f"Warning: CA file not found at {ca_path}; using system trust store.")
        ssl_context.check_hostname = True
        ssl_context.verify_mode = ssl.CERT_REQUIRED
    except Exception as e:
        print(f"Warning: Could not configure SSL context with CA {ca_path}: {e}")
        ssl_context.check_hostname = True
        ssl_context.verify_mode = ssl.CERT_REQUIRED
    return ssl_context


def get_engine() -> AsyncEngine:
    global _engine, _Session
    if _engine is None:
        cfg = get_settings()

        connect_args: dict = {}
        if _needs_ssl(cfg.DATABASE_URL):
            connect_args["ssl"] = _create_ssl_context()

        # NullPool avoids holding idle connections (often preferred in serverless/containers).
        # Switch to the default pool if you want persistent pooling.
        _engine = create_async_engine(
            cfg.DATABASE_URL,
            echo=False,
            pool_pre_ping=True,
            poolclass=NullPool,
            connect_args=connect_args,
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
        result = await s.execute(text("SELECT 1"))
        return result.scalar() == 1
