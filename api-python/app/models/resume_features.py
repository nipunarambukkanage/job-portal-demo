from __future__ import annotations

import uuid
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from datetime import datetime


from app.db.base import Base


class ResumeFeatures(Base):
    """
    Normalized, queryable resume information (1:1 with Resume).
    """
    # Use resume_id as PK and FK for strict one-to-one
    resume_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("resume.id", ondelete="CASCADE"),
        primary_key=True,
    )

    # Basic extracted fields
    full_name: Mapped[Optional[str]] = mapped_column(String(200))
    email: Mapped[Optional[str]] = mapped_column(String(320))
    phone: Mapped[Optional[str]] = mapped_column(String(50))
    summary: Mapped[Optional[str]] = mapped_column(Text)

    skills: Mapped[Optional[list[str]]] = mapped_column(ARRAY(String(100)))
    languages: Mapped[Optional[list[str]]] = mapped_column(ARRAY(String(60)))

    # Complex structures (arrays of objects) kept in JSONB for flexibility
    education: Mapped[Optional[dict]] = mapped_column(JSONB)   # e.g., {"schools": [...]} or a list; your normalizer decides
    experience: Mapped[Optional[dict]] = mapped_column(JSONB)  # e.g., {"jobs": [...]}
    certifications: Mapped[Optional[dict]] = mapped_column(JSONB)

    total_experience_months: Mapped[Optional[int]] = mapped_column(Integer)

    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationship
    resume: Mapped["Resume"] = relationship(back_populates="features")

    def __repr__(self) -> str:  # pragma: no cover
        return f"<ResumeFeatures resume={self.resume_id}>"
