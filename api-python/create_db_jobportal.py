import asyncio
from sqlalchemy import text
from app.db.session import get_engine
from app.db.base import Base

async def main():
    eng = get_engine()
    async with eng.begin() as conn:
        await conn.execute(text("CREATE SCHEMA IF NOT EXISTS pyapi"))
        await conn.run_sync(Base.metadata.create_all)
    await eng.dispose()
    print("Schema/tables ensured in jobportal_pyapi.")
asyncio.run(main())
