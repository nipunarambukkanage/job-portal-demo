from __future__ import annotations

import os
from functools import lru_cache
from typing import List

from pydantic import AnyHttpUrl, Field, PostgresDsn, field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    ENV: str = Field(default=os.getenv("ENV", "dev"))
    PORT: int = Field(default=int(os.getenv("PORT", "8000")))
    LOG_LEVEL: str = Field(default=os.getenv("LOG_LEVEL", "INFO"))

    # CORS (comma-separated list)
    CORS_ORIGINS: str = Field(
        default=os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,https://jobportal971778.z29.web.core.windows.net,https://jobportal.nipunarambukkanage.dev",
        )
    )

    # Clerk (JWT verification)
    CLERK_ISSUER: AnyHttpUrl = AnyHttpUrl(
        "https://trusted-swan-44.clerk.accounts.dev"
    )
    CLERK_JWKS_URL: AnyHttpUrl = AnyHttpUrl(
        "https://trusted-swan-44.clerk.accounts.dev/.well-known/jwks.json"
    )
    CLERK_AUDIENCE: str = "jobportal-api"

    # Data plane
    DATABASE_URL: str = Field(
        default=os.getenv(
            "DATABASE_URL",
            # DO Managed PG (asyncpg) with TLS
            "postgresql+asyncpg://doadmin:password@db-postgresql-blr1-99568-do-user-24900161-0.f.db.ondigitalocean.com:25060/defaultdb?ssl=true",
        )
    )
    REDIS_URL: str = Field(
        default=os.getenv(
            "REDIS_URL",
            "redis://:password@redis-12427.c251.east-us-mz.azure.redns.redis-cloud.com:12427/0",
        )
    )
    AZURE_BLOB_CONN_STR: str = Field(
        default=os.getenv("AZURE_BLOB_CONN_STR", "DefaultEndpointsProtocol=https;AccountName=account;AccountKey=key;EndpointSuffix=core.windows.net")
    )

    # Azure Document Intelligence
    AZURE_DOC_INTEL_ENDPOINT: AnyHttpUrl | None = os.getenv("AZURE_DOC_INTEL_ENDPOINT")  # type: ignore[assignment]
    AZURE_DOC_INTEL_KEY: str | None = os.getenv("AZURE_DOC_INTEL_KEY")
    DOC_INTEL_MODEL: str = os.getenv("DOC_INTEL_MODEL", "prebuilt-resume")
    DOC_INTEL_API_VERSION: str = os.getenv("DOC_INTEL_API_VERSION", "2024-07-31")
    DOC_INTEL_POLL_SECONDS: int = int(os.getenv("DOC_INTEL_POLL_SECONDS", "2"))
    DOC_INTEL_POLL_ATTEMPTS: int = int(os.getenv("DOC_INTEL_POLL_ATTEMPTS", "30"))

    # OTEL (optional)
    OTEL_EXPORTER_OTLP_ENDPOINT: str | None = os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT")
    OTEL_SERVICE_NAME: str = os.getenv("OTEL_SERVICE_NAME", "python-api")

    @property
    def cors_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def normalize_db_url(cls, v: str) -> str:
        # Normalize common DSN variants to asyncpg driver
        if v.startswith("postgres://"):
            v = v.replace("postgres://", "postgresql://", 1)
        if v.startswith("postgresql://") and "+asyncpg" not in v:
            v = v.replace("postgresql://", "postgresql+asyncpg://", 1)
        return v


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    # Cached singleton settings instance
    return Settings()  # type: ignore[call-arg]
