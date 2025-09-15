from __future__ import annotations

import uuid
from enum import Enum
from typing import List, Optional

from sqlalchemy import Boolean, DateTime, Enum as SAEnum, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from datetime import datetime

from app.db.base import Base


class UserRole(str, Enum):
    candidate = "org:member"
    employer = "org:admin"
    admin = "org:admin"


class User(Base):
    """
    System user. 'employer' users can own Jobs; 'candidate' users can upload Resumes & create Applications.
    """
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    external_id: Mapped[Optional[str]] = mapped_column(String(255), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True, nullable=False)
    first_name: Mapped[Optional[str]] = mapped_column(String(100))
    last_name: Mapped[Optional[str]] = mapped_column(String(100))
    full_name: Mapped[Optional[str]] = mapped_column(String(200))
    role: Mapped[UserRole] = mapped_column(SAEnum(UserRole, name="user_role"), nullable=False, index=True, default=UserRole.candidate)
    org_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    headline: Mapped[Optional[str]] = mapped_column(String(200))
    about: Mapped[Optional[str]] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    resumes: Mapped[List["Resume"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    applications: Mapped[List["Application"]] = relationship(back_populates="candidate", cascade="all, delete-orphan")
    jobs: Mapped[List["Job"]] = relationship(back_populates="employer")  # only for employer role

    def __repr__(self) -> str:  # pragma: no cover
        return f"<User {self.id} {self.email} ({self.role})>"
