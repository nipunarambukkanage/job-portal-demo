from __future__ import annotations

from .celery_app import celery_app  # Celery instance
from .resume_tasks import parse_resume_task
from .analytics_tasks import employer_analytics_task, candidate_funnel_task

__all__ = [
    "celery_app",
    "parse_resume_task",
    "employer_analytics_task",
    "candidate_funnel_task",
]
