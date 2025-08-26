from __future__ import annotations

import asyncio
import logging
import uuid
from typing import Any, Dict

from celery import shared_task
from sqlalchemy.ext.asyncio import AsyncSession

from app.workers.celery_app import celery_app
from app.db.session import async_session
from app.services.analytics import employer_applications_summary, candidate_funnel_summary

log = logging.getLogger(__name__)


async def _run_employer(employer_id: uuid.UUID) -> Dict[str, Any]:
    async with async_session() as session:  # type: AsyncSession
        return await employer_applications_summary(session, employer_id=employer_id)


async def _run_candidate(candidate_id: uuid.UUID) -> Dict[str, Any]:
    async with async_session() as session:  # type: AsyncSession
        return await candidate_funnel_summary(session, candidate_id=candidate_id)


@celery_app.task(name="analytics.employer_summary")
def employer_analytics_task(employer_id: str) -> Dict[str, Any]:
    try:
        eid = uuid.UUID(employer_id)
    except Exception as ex:
        raise ValueError(f"Invalid employer_id: {employer_id}") from ex

    try:
        return asyncio.run(_run_employer(eid))
    except Exception:
        log.exception("employer_analytics_task_failed", extra={"employer_id": employer_id})
        raise


@celery_app.task(name="analytics.candidate_funnel")
def candidate_funnel_task(candidate_id: str) -> Dict[str, Any]:
    try:
        cid = uuid.UUID(candidate_id)
    except Exception as ex:
        raise ValueError(f"Invalid candidate_id: {candidate_id}") from ex

    try:
        return asyncio.run(_run_candidate(cid))
    except Exception:
        log.exception("candidate_funnel_task_failed", extra={"candidate_id": candidate_id})
        raise
