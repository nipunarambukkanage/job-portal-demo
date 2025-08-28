from __future__ import annotations

import logging

from sqlalchemy import text

from app.db.session import async_session

log = logging.getLogger(__name__)


async def init_db() -> None:
    """
    Idempotent hook for initial DB setup/verification.
    In production, schema changes should be handled by Alembic migrations.
    """
    async with async_session() as s:
        await s.execute(text("SELECT 1"))
        log.info("Database init check completed")
