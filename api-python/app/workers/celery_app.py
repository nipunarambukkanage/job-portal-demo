from __future__ import annotations

import os
from celery import Celery


def _redis_url() -> str:
    url = os.getenv("REDIS_URL")
    if not url:
        raise RuntimeError("REDIS_URL is not set (required for Celery broker/back-end)")
    return url


def make_celery() -> Celery:
    broker = _redis_url()
    backend = broker
    app = Celery(
        "job_portal_workers",
        broker=broker,
        backend=backend,
        include=[
            "app.workers.resume_tasks",
            "app.workers.analytics_tasks",
        ],
    )
    app.conf.update(
        task_serializer="json",
        accept_content=["json"],
        result_serializer="json",
        timezone="UTC",
        enable_utc=True,
        task_acks_late=True,
        worker_prefetch_multiplier=1,
        broker_transport_options={"visibility_timeout": 3600},
        result_expires=3600,
    )
    return app


celery_app = make_celery()
