import asyncio
from sqlalchemy import text
from app.db.session import get_engine
from app.db.base import Base

async def main():
    engine = get_engine()
    async with engine.begin() as conn:
        # Ensure schema exists
        await conn.execute(text("CREATE SCHEMA IF NOT EXISTS pyapi"))
        # Create all tables registered on metadata
        await conn.run_sync(Base.metadata.create_all)
    await engine.dispose()

asyncio.run(main())
