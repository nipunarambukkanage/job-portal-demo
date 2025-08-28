from __future__ import annotations

import asyncio
import os
import ssl
from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.engine.url import make_url, URL
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine

# Alembic Config
config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

from app.db.base import Base  # noqa: E402

target_metadata = Base.metadata

# Use environment variable or fall back to config file
DATABASE_URL = os.getenv("DATABASE_URL") or config.get_main_option("sqlalchemy.url")
if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL not set (e.g., postgresql+asyncpg://user:pass@host:port/db)"
    )

# Set the main option for alembic
config.set_main_option("sqlalchemy.url", DATABASE_URL)

INCLUDE_SCHEMAS = True


def _normalized_asyncpg_url_and_connect_args(url_str: str) -> tuple[str, dict]:
    url = make_url(url_str)
    connect_args: dict = {}

    if url.drivername.startswith("postgresql+asyncpg"):
        # Handle SSL certificate
        cafile = os.getenv("PGSSLROOTCERT", r"C:\Users\ADMIN\Downloads\do-db-ca.crt")
        
        # Always use SSL context for DigitalOcean
        if os.path.isfile(cafile):
            ctx = ssl.create_default_context(cafile=cafile)
            # For DigitalOcean, we need to verify the certificate
            ctx.check_hostname = True
            ctx.verify_mode = ssl.CERT_REQUIRED
        else:
            # Fallback: create default context but require SSL
            ctx = ssl.create_default_context()
            ctx.check_hostname = True
            ctx.verify_mode = ssl.CERT_REQUIRED
        
        connect_args["ssl"] = ctx

        # Remove sslmode from query string to avoid conflicts with asyncpg
        query_dict = dict(url.query)
        query_dict.pop("sslmode", None)
        query_dict.pop("sslrootcert", None)
        url = url.set(query=query_dict)

    return str(url), connect_args


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url, connect_args = _normalized_asyncpg_url_and_connect_args(DATABASE_URL)
    
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
    """Run migrations in 'online' mode with given connection."""
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        include_schemas=INCLUDE_SCHEMAS,
        version_table="alembic_version",
        version_table_schema=target_metadata.schema or "pyapi",
        compare_type=True,
        compare_server_default=True,
    )
    
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    url, connect_args = _normalized_asyncpg_url_and_connect_args(DATABASE_URL)
    
    # Create async engine with proper SSL configuration
    engine: AsyncEngine = create_async_engine(
        url, 
        poolclass=pool.NullPool, 
        connect_args=connect_args,
        echo=True  # Enable SQL echo for debugging
    )
    
    try:
        async with engine.connect() as conn:
            await conn.run_sync(do_run_migrations)
    finally:
        await engine.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    # Run the async migrations
    asyncio.run(run_migrations_online())