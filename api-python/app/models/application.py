from __future__ import annotations

import uuid
from enum import Enum
from typing import Optional

from sqlalchemy import DateTime, Enum as SAEnum, ForeignKey, UniqueConstraint, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ApplicationStatus(str, Enum):
    submitted = "submitted"
    reviewing = "reviewing"
    shortlisted = "shortlisted"
    rejected = "rejected"
    offered = "offered"
    hired = "hired"


class Application(Base):
    """
    Candidate's application to a Job. One application per candidate per job (enforced by unique constraint).
    """
    __table_args__ = (
        UniqueConstraint("candidate_id", "job_id", name="uq_application_candidate_job"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    job_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("job.id", ondelete="CASCADE"), nullable=False, index=True)
    candidate_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("user.id", ondelete="CASCADE"), nullable=False, index=True)
    resume_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("resume.id", ondelete="SET NULL"), index=True)

    status: Mapped[ApplicationStatus] = mapped_column(SAEnum(ApplicationStatus, name="application_status"), default=ApplicationStatus.submitted, nullable=False, index=True)

    cover_letter: Mapped[Optional[str]] = mapped_column(String(4000))

    applied_at: Mapped["datetime"] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped["datetime"] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    job: Mapped["Job"] = relationship(back_populates="applications")
    candidate: Mapped["User"] = relationship(back_populates="applications")
    resume: Mapped[Optional["Resume"]] = relationship(back_populates="applications")

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Application {self.id} job={self.job_id} candidate={self.candidate_id} status={self.status}>"
