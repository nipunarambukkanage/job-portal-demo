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

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# === Load SQLAlchemy metadata ===
from app.db.base import Base  # noqa: E402
target_metadata = Base.metadata

# === Database URL from env ===
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL not set (e.g., postgresql+asyncpg://user:pass@host:port/db?sslmode=require)")

config.set_main_option("sqlalchemy.url", DATABASE_URL)

INCLUDE_SCHEMAS = True
