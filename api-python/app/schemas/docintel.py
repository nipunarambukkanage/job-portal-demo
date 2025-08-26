from __future__ import annotations

from datetime import date, datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class DocIntelRaw(BaseModel):
    """
    Carrier for the raw Azure Document Intelligence analyze JSON.
    Keep as dict to avoid tight coupling to API versions.
    """
    data: dict[str, Any]
    model_config = ConfigDict(arbitrary_types_allowed=True)


class NormalizedExperienceItem(BaseModel):
    title: str | None = None
    company: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    is_current: bool | None = None
    description: str | None = None
    location: str | None = None


class NormalizedEducationItem(BaseModel):
    institution: str | None = None
    degree: str | None = None
    field_of_study: str | None = None
    start_date: date | None = None
    end_date: date | None = None


class NormalizedCertificationItem(BaseModel):
    name: str | None = None
    issuer: str | None = None
    issued_date: date | None = None
    expires_date: date | None = None


class NormalizedContactInfo(BaseModel):
    full_name: str | None = None
    emails: list[str] | None = None
    phones: list[str] | None = None
    websites: list[str] | None = None
    location: str | None = None


class ResumeFeaturesNormalized(BaseModel):
    """
    Canonical normalized feature set derived from Doc Intel outputs.
    Mirrors the DB's ResumeFeatures structure closely.
    """
    resume_id: "uuid.UUID | None" = None  # optional when used as payload
    contact: NormalizedContactInfo | None = None
    summary: str | None = None
    skills: list[str] | None = None
    languages: list[str] | None = None
    experience: list[NormalizedExperienceItem] | None = None
    education: list[NormalizedEducationItem] | None = None
    certifications: list[NormalizedCertificationItem] | None = None
    total_experience_months: int | None = None
    updated_at: datetime | None = None
