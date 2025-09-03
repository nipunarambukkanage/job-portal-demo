from __future__ import annotations
from sqlalchemy import Column, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.sql import func
import uuid
from app.db.base import Base  # schema="pyapi" is already configured in Base :contentReference[oaicite:13]{index=13}

class UserStarredJob(Base):
    __tablename__ = "user_starred_job"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, insert_default=uuid.uuid4)
    user_clerk_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    job_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())

class JobKeywords(Base):
    __tablename__ = "job_keywords"
    job_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    keywords: Mapped[list[str]] = mapped_column(ARRAY(String), nullable=False)
    updated_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
