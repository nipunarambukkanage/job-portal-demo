from __future__ import annotations

import uuid
from enum import Enum
from datetime import datetime

from pydantic import BaseModel, Field

from .common import ORMModel, EntityId, EntityTimestamps


class ParseStatus(str, Enum):
    pending = "pending"
    parsed = "parsed"
    failed = "failed"


class ResumeIngestRequest(BaseModel):
    """
    Request payload when client notifies backend of a newly uploaded resume.
    Supply blob_url and optional file metadata (recommended).
    """
    blob_url: str
    file_name: str | None = None
    mime_type: str | None = None
    size_bytes: int | None = Field(default=None, ge=0)


class ResumeRead(EntityId, EntityTimestamps):
    user_id: uuid.UUID
    file_name: str
    mime_type: str
    size_bytes: int
    blob_url: str
    parse_status: ParseStatus
    parse_error: str | None = None
    raw_docintel: dict | None = None
    uploaded_at: datetime | None = None


class ResumeFeaturesRead(ORMModel):
    resume_id: uuid.UUID
    full_name: str | None = None
    email: str | None = None
    phone: str | None = None
    summary: str | None = None
    skills: list[str] | None = None
    languages: list[str] | None = None
    education: dict | None = None
    experience: dict | None = None
    certifications: dict | None = None
    total_experience_months: int | None = None
    updated_at: datetime | None = None
