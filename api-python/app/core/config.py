from __future__ import annotations

from functools import lru_cache
from typing import List, Optional

from pydantic import AnyHttpUrl, Field, AliasChoices, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", ".env.local"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ===== App =====
    ENV: str = "dev"
    PORT: int = 8000
    LOG_LEVEL: str = "INFO"

    # CORS (comma-separated)
    CORS_ORIGINS: str = "http://localhost:5173"

    # ===== Auth (Clerk) – not secrets but configurable =====
    CLERK_ISSUER: Optional[AnyHttpUrl] = None
    CLERK_JWKS_URL: Optional[AnyHttpUrl] = None
    CLERK_AUDIENCE: Optional[str] = None

    # ===== Data plane (required via env in real deployments) =====
    DATABASE_URL: str = Field(
        default="",
        description="e.g. postgresql+asyncpg://user:pass@host:port/db?sslmode=require",
    )
    REDIS_URL: str = Field(
        default="",
        description="e.g. redis://:password@host:port/0?ssl=true",
    )

    AZURE_BLOB_CONNECTION_STRING: str = Field(
        default="",
        validation_alias=AliasChoices("AZURE_BLOB_CONNECTION_STRING", "AZURE_BLOB_CONN_STR"),
        description="Azure Storage connection string",
    )

    # ===== Azure Document Intelligence =====
    AZURE_DOC_INTEL_ENDPOINT: Optional[AnyHttpUrl] = None
    AZURE_DOC_INTEL_KEY: Optional[str] = None
    DOC_INTEL_MODEL: str = "prebuilt-resume"
    DOC_INTEL_API_VERSION: str = "2024-07-31"
    DOC_INTEL_POLL_SECONDS: int = 2
    DOC_INTEL_POLL_ATTEMPTS: int = 30

    # ===== OTEL =====
    OTEL_EXPORTER_OTLP_ENDPOINT: Optional[str] = None
    OTEL_SERVICE_NAME: str = "python-api"

    @property
    def cors_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def normalize_db_url(cls, v: str) -> str:
        if not v:
            return v
        if v.startswith("postgres://"):
            v = v.replace("postgres://", "postgresql://", 1)
        if v.startswith("postgresql://") and "+asyncpg" not in v:
            v = v.replace("postgresql://", "postgresql+asyncpg://", 1)
        return v


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
