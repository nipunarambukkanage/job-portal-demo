from __future__ import annotations

import uuid
from enum import Enum

from pydantic import Field, conlist

from .common import ORMModel, EntityId, EntityTimestamps


class EmploymentType(str, Enum):
    full_time = "full_time"
    part_time = "part_time"
    contract = "contract"
    internship = "internship"
    temporary = "temporary"


class JobBase(ORMModel):
    title: str = Field(min_length=1, max_length=200)
    description: str
    location: str | None = None
    employment_type: EmploymentType = EmploymentType.full_time
    skills: list[str] | None = None
    is_active: bool = True


class JobCreate(JobBase):
    employer_id: uuid.UUID | None = None


class JobUpdate(ORMModel):
    title: str | None = None
    description: str | None = None
    location: str | None = None
    employment_type: EmploymentType | None = None
    skills: list[str] | None = None
    is_active: bool | None = None


class JobRead(EntityId, JobBase, EntityTimestamps):
    employer_id: uuid.UUID
