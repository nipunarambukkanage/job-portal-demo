powershell -NoProfile -Command ^
  "@'
from __future__ import annotations

from dotenv import load_dotenv
load_dotenv()

import asyncio
import os
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine

from alembic import context

# Alembic Config object
config = context.config

# Configure logging via alembic.ini
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# --- SQLAlchemy metadata ---
from app.db.base import Base          # defines Base only (no model imports)
import app.models  # noqa: F401       # side-effect: registers all models

target_metadata = Base.metadata

# --- Database URL from env ---
DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    raise RuntimeError('DATABASE_URL not set (e.g., postgresql+asyncpg://user:pass@host:port/db?sslmode=require)')

config.set_main_option('sqlalchemy.url', DATABASE_URL)

# Use your dedicated schema and keep version table there
INCLUDE_SCHEMAS = True
VERSION_TABLE = 'alembic_version'
VERSION_SCHEMA = target_metadata.schema or 'pyapi'

def run_migrations_offline() -> None:
    url = config.get_main_option('sqlalchemy.url') or DATABASE_URL
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={'paramstyle': 'named'},
        include_schemas=INCLUDE_SCHEMAS,
        version_table=VERSION_TABLE,
        version_table_schema=VERSION_SCHEMA,
    )
    with context.begin_transaction():
        context.run_migrations()

def do_run_migrations(connection: Connection) -> None:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        include_schemas=INCLUDE_SCHEMAS,
        version_table=VERSION_TABLE,
        version_table_schema=VERSION_SCHEMA,
    )
    with context.begin_transaction():
        context.run_migrations()

async def run_migrations_online() -> None:
    connectable: AsyncEngine = create_async_engine(DATABASE_URL, poolclass=pool.NullPool)
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()

if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
'@ | Set-Content -Path migrations\env.py -NoNewline -Encoding UTF8"
