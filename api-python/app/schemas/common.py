from __future__ import annotations

import uuid
from datetime import datetime
from typing import Generic, Sequence, TypeVar

from pydantic import BaseModel, ConfigDict, Field

T = TypeVar("T")


class ORMModel(BaseModel):
    """Base for schemas that may be created from ORM objects."""
    model_config = ConfigDict(from_attributes=True)


class PageParams(BaseModel):
    page: int = Field(1, ge=1)
    size: int = Field(20, ge=1, le=200)


class Page(ORMModel, Generic[T]):
    items: Sequence[T]
    page: int
    size: int
    total: int


class EntityTimestamps(ORMModel):
    created_at: datetime | None = None
    updated_at: datetime | None = None


class EntityId(ORMModel):
    id: uuid.UUID
