from __future__ import annotations

from typing import Dict, List, Tuple

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.job import Job
from app.models.application import Application, ApplicationStatus


async def employer_applications_summary(session: AsyncSession, *, employer_id: "uuid.UUID") -> Dict:
    """
    Returns counts of applications by status across all jobs for a given employer.
    """
    import uuid  # delayed import for type

    jobs_q = select(Job.id).where(Job.employer_id == employer_id)
    job_ids = [row[0] for row in (await session.execute(jobs_q)).all()]
    if not job_ids:
        return {"employer_id": str(employer_id), "applications": 0, "by_status": {}}

    counts_q = (
        select(Application.status, func.count())
        .where(Application.job_id.in_(job_ids))
        .group_by(Application.status)
    )
    rows = (await session.execute(counts_q)).all()

    total = 0
    by_status: Dict[str, int] = {}
    for status, cnt in rows:
        total += int(cnt)
        by_status[status.value if hasattr(status, "value") else str(status)] = int(cnt)

    return {"employer_id": str(employer_id), "applications": total, "by_status": by_status}


async def candidate_funnel_summary(session: AsyncSession, *, candidate_id: "uuid.UUID") -> Dict:
    """
    Returns funnel metrics for a candidate's applications.
    """
    counts_q = (
        select(Application.status, func.count())
        .where(Application.candidate_id == candidate_id)
        .group_by(Application.status)
    )
    rows = (await session.execute(counts_q)).all()

    # Derive simple funnel
    submitted = sum(int(c) for s, c in rows if s == ApplicationStatus.submitted)
    reviewing = sum(int(c) for s, c in rows if s == ApplicationStatus.reviewing)
    shortlisted = sum(int(c) for s, c in rows if s == ApplicationStatus.shortlisted)
    rejected = sum(int(c) for s, c in rows if s == ApplicationStatus.rejected)
    offered = sum(int(c) for s, c in rows if s == ApplicationStatus.offered)
    hired = sum(int(c) for s, c in rows if s == ApplicationStatus.hired)

    return {
        "candidate_id": str(candidate_id),
        "by_status": {
            "submitted": submitted,
            "reviewing": reviewing,
            "shortlisted": shortlisted,
            "rejected": rejected,
            "offered": offered,
            "hired": hired,
        },
    }
