# app/routes/ai_alias.py
from __future__ import annotations

import uuid
from datetime import date, datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Query
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import async_session

router = APIRouter()


# ----- Response models -----
class Point(BaseModel):
    x: str  # ISO date (YYYY-MM-DD)
    y: int


class Series(BaseModel):
    name: str
    data: List[Point]


def _to_start_of_day(d: date) -> datetime:
    return datetime(d.year, d.month, d.day)


def _to_end_of_day(d: date) -> datetime:
    # exclusive upper bound (next midnight)
    return datetime(d.year, d.month, d.day) + timedelta(days=1)


@router.get("/recommendations", summary="AI recommendations (alias)")
async def recommend():
    # Kept as a stub for now
    return {"items": []}


@router.get(
    "/analytics",
    response_model=List[Series],
    summary="Applications by day (from public.applications)",
)
async def analytics(
    from_: Optional[date] = Query(None, alias="from"),
    to_: Optional[date] = Query(None, alias="to"),
    user_id: Optional[str] = Query(
        None, description="Filter by applications.applicant_user_id (TEXT)"
    ),
    job_id: Optional[uuid.UUID] = Query(
        None, description="Filter by applications.job_id (UUID)"
    ),
) -> List[Series]:
    """
    Returns:
      [
        { "name": "Applications", "data": [ {"x":"2025-09-01","y":4}, ... ] }
      ]

    Source table: public.applications
      - created_at (timestamptz)
      - applicant_user_id (text)
      - job_id (uuid)

    Filters (all optional):
      - user_id : TEXT (applications.applicant_user_id)
      - job_id  : UUID (applications.job_id)
      - from,to : inclusive day window on created_at
                  (implemented as [from 00:00:00, to+1 00:00:00))
    """
    # Basic validation of the date window (avoid accidental inverted ranges)
    if from_ and to_ and from_ > to_:
        return [Series(name="Applications", data=[])]

    where_clauses = []
    params: dict[str, object] = {}

    if user_id:
        where_clauses.append("applicant_user_id = :user_id")
        params["user_id"] = user_id

    if job_id:
        where_clauses.append("job_id = :job_id")
        params["job_id"] = str(job_id)

    if from_:
        where_clauses.append("created_at >= :from_ts")
        params["from_ts"] = _to_start_of_day(from_)

    if to_:
        where_clauses.append("created_at < :to_ts")
        params["to_ts"] = _to_end_of_day(to_)

    where_sql = f"WHERE {' AND '.join(where_clauses)}" if where_clauses else ""

    # Group by day (UTC boundary on timestamptz)
    sql = f"""
      SELECT date_trunc('day', created_at) AS d, COUNT(*)::int AS c
      FROM public.applications
      {where_sql}
      GROUP BY 1
      ORDER BY 1 ASC
    """

    async with async_session() as session:  # type: AsyncSession
        rows = (await session.execute(text(sql), params)).all()

    data = [Point(x=row[0].date().isoformat(), y=row[1]) for row in rows]
    return [Series(name="Applications", data=data)]
