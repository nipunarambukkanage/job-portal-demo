from __future__ import annotations

from sqlalchemy import MetaData
from sqlalchemy.orm import DeclarativeBase, declared_attr

NAMING_CONVENTION: dict[str, str] = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}

DEFAULT_METADATA = MetaData(schema="pyapi", naming_convention=NAMING_CONVENTION)


class Base(DeclarativeBase):
    """Project-wide SQLAlchemy declarative base."""
    metadata = DEFAULT_METADATA

    @declared_attr.directive
    def __tablename__(cls) -> str:  # type: ignore[override]
        return cls.__name__.lower()


from app.models.user import User  # noqa: F401,E402
from app.models.job import Job  # noqa: F401,E402
from app.models.application import Application  # noqa: F401,E402
from app.models.resume import Resume  # noqa: F401,E402
from app.models.resume_features import ResumeFeatures  # noqa: F401,E402
from app.models.audit import AuditLog  # noqa: F401,E402
