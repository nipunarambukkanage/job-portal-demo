from __future__ import annotations

import uuid
from enum import Enum

from pydantic import Field

from .common import ORMModel, EntityId, EntityTimestamps


class ApplicationStatus(str, Enum):
    submitted = "submitted"
    reviewing = "reviewing"
    shortlisted = "shortlisted"
    rejected = "rejected"
    offered = "offered"
    hired = "hired"


class ApplicationCreate(ORMModel):
    job_id: uuid.UUID
    resume_id: uuid.UUID | None = None
    cover_letter: str | None = Field(default=None, max_length=4000)


class ApplicationStatusUpdate(ORMModel):
    status: ApplicationStatus


class ApplicationRead(EntityId, EntityTimestamps):
    job_id: uuid.UUID
    candidate_id: uuid.UUID
    resume_id: uuid.UUID | None = None
    status: ApplicationStatus
    cover_letter: str | None = None
    applied_at: "datetime | None" = None  # kept for parity with model
