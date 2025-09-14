from __future__ import annotations

import uuid
from enum import Enum
from typing import List, Optional

from pydantic import Field, validator

from .common import ORMModel, EntityId, EntityTimestamps


class EmploymentType(str, Enum):
    full_time = "full_time"
    part_time = "part_time"
    contract = "contract"
    internship = "internship"
    temporary = "temporary"


class JobBase(ORMModel):
    title: str = Field(min_length=1, max_length=200, description="Job title")
    description: str = Field(min_length=10, description="Job description")
    location: Optional[str] = Field(None, max_length=100, description="Job location")
    employment_type: EmploymentType = Field(EmploymentType.full_time, description="Type of employment")
    skills: Optional[List[str]] = Field(None, description="Required skills")
    is_active: bool = Field(True, description="Whether the job is active")

    @validator('skills')
    def validate_skills(cls, v):
        if v:
            # Remove empty strings and duplicates, limit to 20 skills
            cleaned = list(dict.fromkeys([skill.strip() for skill in v if skill.strip()]))
            if len(cleaned) > 20:
                raise ValueError("Maximum 20 skills allowed")
            return cleaned or None
        return None


class JobCreateRequest(JobBase):
    """Request schema for creating a new job."""
    employer_id: Optional[uuid.UUID] = Field(None, description="Employer ID (auto-filled from auth if not provided)")


class JobUpdateRequest(ORMModel):
    """Request schema for updating an existing job."""
    title: Optional[str] = Field(None, min_length=1, max_length=200, description="Job title")
    description: Optional[str] = Field(None, min_length=10, description="Job description")
    location: Optional[str] = Field(None, max_length=100, description="Job location")
    employment_type: Optional[EmploymentType] = Field(None, description="Type of employment")
    skills: Optional[List[str]] = Field(None, description="Required skills")
    is_active: Optional[bool] = Field(None, description="Whether the job is active")

    @validator('skills')
    def validate_skills(cls, v):
        if v is not None:
            # Remove empty strings and duplicates, limit to 20 skills
            cleaned = list(dict.fromkeys([skill.strip() for skill in v if skill.strip()]))
            if len(cleaned) > 20:
                raise ValueError("Maximum 20 skills allowed")
            return cleaned or None
        return v


class JobResponse(EntityId, JobBase, EntityTimestamps):
    """Response schema for job data."""
    employer_id: uuid.UUID


class JobListRequest(ORMModel):
    """Request schema for listing jobs with filters."""
    q: Optional[str] = Field(None, max_length=100, description="Search query")
    skills: Optional[List[str]] = Field(None, description="Filter by skills")
    employment_type: Optional[EmploymentType] = Field(None, description="Filter by employment type")
    only_active: bool = Field(True, description="Only show active jobs")
    page: int = Field(1, ge=1, description="Page number (1-based)")
    size: int = Field(20, ge=1, le=100, description="Page size (1-100)")

    @validator('skills')
    def validate_skills(cls, v):
        if v:
            # Remove empty strings and duplicates
            cleaned = list(dict.fromkeys([skill.strip() for skill in v if skill.strip()]))
            return cleaned or None
        return None


class JobListResponse(ORMModel):
    """Response schema for job listing."""
    items: List[JobResponse] = Field(description="List of jobs")
    total: int = Field(description="Total number of jobs matching filters")
    page: int = Field(description="Current page number")
    size: int = Field(description="Page size")
    total_pages: int = Field(description="Total number of pages")

    @validator('total_pages', pre=False, always=True)
    def calculate_total_pages(cls, v, values):
        total = values.get('total', 0)
        size = values.get('size', 1)
        return (total + size - 1) // size if total > 0 else 0


# Legacy aliases for backward compatibility
JobCreate = JobCreateRequest
JobUpdate = JobUpdateRequest
JobRead = JobResponse
