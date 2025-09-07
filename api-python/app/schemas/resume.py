from __future__ import annotations

import uuid
from enum import Enum
from datetime import datetime

from pydantic import BaseModel, Field, AnyUrl

from .common import ORMModel, EntityId, EntityTimestamps

from typing import Optional


class ParseStatus(str, Enum):
    pending = "pending"
    parsed = "parsed"
    failed = "failed"



class ResumeIngestRequest(BaseModel):
    blob_url: AnyUrl
    blob_sas_url: Optional[AnyUrl] = None
    file_name: Optional[str] = None
    mime_type: Optional[str] = None
    size_bytes: Optional[int] = Field(default=0, ge=0)
    job_id: Optional[uuid.UUID] = None


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
