powershell -NoProfile -Command ^
  "@'
from __future__ import annotations

from sqlalchemy import MetaData
from sqlalchemy.orm import DeclarativeBase, declared_attr

NAMING_CONVENTION: dict[str, str] = {
    'ix': 'ix_%(column_0_label)s',
    'uq': 'uq_%(table_name)s_%(column_0_name)s',
    'ck': 'ck_%(table_name)s_%(constraint_name)s',
    'fk': 'fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s',
    'pk': 'pk_%(table_name)s',
}

# Keep your project using the `pyapi` schema
DEFAULT_METADATA = MetaData(schema='pyapi', naming_convention=NAMING_CONVENTION)

class Base(DeclarativeBase):
    \"\"\"Project-wide SQLAlchemy declarative base.\"\"\"
    metadata = DEFAULT_METADATA

    @declared_attr.directive
    def __tablename__(cls) -> str:  # type: ignore[override]
        return cls.__name__.lower()
'@ | Set-Content -Path app\db\base.py -NoNewline -Encoding UTF8"
