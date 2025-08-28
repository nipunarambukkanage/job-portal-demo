from __future__ import annotations

import asyncio
import uuid
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import async_session
from app.models.user import User, UserRole
from app.models.job import Job, EmploymentType
from app.models.resume_features import ResumeFeatures


async def _get_or_create_user(session: AsyncSession, *, email: str, full_name: str, role: UserRole) -> User:
    existing = (await session.execute(select(User).where(User.email == email))).scalar_one_or_none()
    if existing:
        return existing
    u = User(email=email, full_name=full_name, role=role)
    session.add(u)
    await session.flush()
    return u


async def _get_or_create_job(
    session: AsyncSession,
    *,
    employer_id: uuid.UUID,
    title: str,
    description: str,
    location: str | None,
    employment_type: EmploymentType,
    skills: list[str] | None = None,
) -> Job:
    existing = (
        await session.execute(
            select(Job).where(Job.employer_id == employer_id, Job.title == title)
        )
    ).scalar_one_or_none()
    if existing:
        return existing
    j = Job(
        employer_id=employer_id,
        title=title,
        description=description,
        location=location,
        employment_type=employment_type,
        skills=skills or [],
        is_active=True,
    )
    session.add(j)
    await session.flush()
    return j


async def _get_or_create_resume_features(
    session: AsyncSession,
    *,
    resume_id: uuid.UUID,
    full_name: str,
    email: str,
    skills: list[str],
) -> ResumeFeatures:
    existing = (
        await session.execute(
            select(ResumeFeatures).where(ResumeFeatures.resume_id == resume_id)
        )
    ).scalar_one_or_none()
    if existing:
        return existing
    rf = ResumeFeatures(
        resume_id=resume_id,
        full_name=full_name,
        email=email,
        skills=skills,
        education={"items": []},
        experience={"items": []},
    )
    session.add(rf)
    await session.flush()
    return rf


async def seed() -> dict[str, Any]:
    async with async_session() as session:
        # Users
        employer = await _get_or_create_user(
            session, email="employer@example.com", full_name="Acme HR", role=UserRole.employer
        )
        candidate = await _get_or_create_user(
            session, email="candidate@example.com", full_name="Jane Candidate", role=UserRole.candidate
        )

        # Jobs
        job1 = await _get_or_create_job(
            session,
            employer_id=employer.id,
            title="Backend Engineer (Python/FastAPI)",
            description="Own APIs, database models, and async workers.",
            location="Remote",
            employment_type=EmploymentType.full_time,
            skills=["python", "fastapi", "postgres", "redis", "docker"],
        )
        job2 = await _get_or_create_job(
            session,
            employer_id=employer.id,
            title="ML Engineer (NLP)",
            description="Ship embeddings, ranking, and recommendation systems.",
            location="Colombo, LK",
            employment_type=EmploymentType.full_time,
            skills=["python", "pytorch", "mlops", "nlp", "vector"],
        )

        resume_id = uuid.uuid4()
        await _get_or_create_resume_features(
            session,
            resume_id=resume_id,
            full_name="Jane Candidate",
            email="candidate@example.com",
            skills=["python", "fastapi", "postgres", "mlops", "nlp"],
        )

        return {
            "employer_id": str(employer.id),
            "candidate_id": str(candidate.id),
            "jobs": [str(job1.id), str(job2.id)],
            "seed_resume_id": str(resume_id),
        }


def main() -> None:
    out = asyncio.run(seed())
    print("Seed complete:", out)


if __name__ == "__main__":
    main()
