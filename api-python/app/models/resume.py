from __future__ import annotations

import uuid
from enum import Enum
from typing import List, Optional

from sqlalchemy import DateTime, Enum as SAEnum, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from datetime import datetime


from app.db.base import Base


class ParseStatus(str, Enum):
    pending = "pending"
    parsed = "parsed"
    failed = "failed"


class Resume(Base):
    """
    Resume uploaded by a candidate. Raw Doc Intelligence JSON may be stored for debugging.
    Parsed/normalized features live in ResumeFeatures (1:1).
    """
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("user.id", ondelete="CASCADE"), nullable=False, index=True
    )

    file_name: Mapped[str] = mapped_column(String(300), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(120), nullable=False)
    size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)

    # Where the file lives (e.g., Azure Blob SAS or path reference managed by your storage layer)
    blob_url: Mapped[str] = mapped_column(Text, nullable=False)

    parse_status: Mapped[ParseStatus] = mapped_column(SAEnum(ParseStatus, name="parse_status"), default=ParseStatus.pending, nullable=False, index=True)
    parse_error: Mapped[Optional[str]] = mapped_column(String(1000))

    # Optional: keep a trimmed Doc Intelligence response for diagnostics (NOT the full PDF)
    raw_docintel: Mapped[Optional[dict]] = mapped_column(JSONB)

    uploaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user: Mapped["User"] = relationship(back_populates="resumes")
    features: Mapped[Optional["ResumeFeatures"]] = relationship(back_populates="resume", uselist=False, cascade="all, delete-orphan")
    applications: Mapped[List["Application"]] = relationship(back_populates="resume")

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Resume {self.id} user={self.user_id} status={self.parse_status}>"
