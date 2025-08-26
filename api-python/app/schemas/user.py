from __future__ import annotations

import uuid
from enum import Enum

from pydantic import EmailStr, Field

from .common import ORMModel, EntityId, EntityTimestamps


class UserRole(str, Enum):
    candidate = "candidate"
    employer = "employer"
    admin = "admin"


class UserBase(ORMModel):
    email: EmailStr
    full_name: str | None = Field(default=None)
    role: UserRole = UserRole.candidate
    headline: str | None = None
    about: str | None = None


class UserCreate(UserBase):
    pass


class UserUpdate(ORMModel):
    full_name: str | None = None
    role: UserRole | None = None
    headline: str | None = None
    about: str | None = None


class UserRead(EntityId, UserBase, EntityTimestamps):
    pass
