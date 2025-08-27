from __future__ import annotations

import asyncio
import os
from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.engine.url import make_url
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine

# Alembic Config
config = context.config

# Logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Load your project Base (metadata)
from app.db.base import Base  # noqa: E402

target_metadata = Base.metadata

# Read DATABASE_URL from env (set by you before running)
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL not set (e.g., postgresql+asyncpg://user:pass@host:port/db)"
    )

# Keep Alembic aware of the URL (even though we'll normalize it)
config.set_main_option("sqlalchemy.url", DATABASE_URL)

INCLUDE_SCHEMAS = True


def _normalized_asyncpg_url_and_connect_args(url_str: str) -> tuple[str, dict]:
    """
    If using postgresql+asyncpg and URL contains ?sslmode=..., drop it and
    set connect_args['ssl'] = True (asyncpg style).
    """
    url = make_url(url_str)
    connect_args: dict = {}

    if url.drivername.startswith("postgresql+asyncpg"):
        q = dict(url.query)
        # Drop sslmode (unsupported by asyncpg)
        if "sslmode" in q:
            q.pop("sslmode", None)
        # Rebuild URL without sslmode
        url = url.set(query=q)
        # Tell asyncpg to use SSL
        connect_args["ssl"] = True

    return str(url), connect_args


def run_migrations_offline() -> None:
    url, _ = _normalized_asyncpg_url_and_connect_args(DATABASE_URL)
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        include_schemas=INCLUDE_SCHEMAS,
        version_table="alembic_version",
        version_table_schema=target_metadata.schema or "pyapi",
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        include_schemas=INCLUDE_SCHEMAS,
        version_table="alembic_version",
        version_table_schema=target_metadata.schema or "pyapi",
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    url, connect_args = _normalized_asyncpg_url_and_connect_args(DATABASE_URL)
    engine: AsyncEngine = create_async_engine(
        url, poolclass=pool.NullPool, connect_args=connect_args
    )
    async with engine.connect() as conn:
        await conn.run_sync(do_run_migrations)
    await engine.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
