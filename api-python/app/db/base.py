from __future__ import annotations

from sqlalchemy import MetaData
from sqlalchemy.orm import DeclarativeBase, declared_attr

# Deterministic names for constraints / indexes (great for Alembic diffs)
NAMING_CONVENTION = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}

# Keep all objects in the "pyapi" schema
metadata_obj = MetaData(schema="pyapi", naming_convention=NAMING_CONVENTION)


class Base(DeclarativeBase):
    """Project-wide SQLAlchemy declarative base."""
    metadata = metadata_obj

    @declared_attr.directive
    def __tablename__(cls) -> str:  # type: ignore[override]
        return cls.__name__.lower()
