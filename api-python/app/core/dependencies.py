from __future__ import annotations

from typing import AsyncGenerator, Dict, Any, Annotated
from functools import lru_cache

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings, get_settings
from app.core.security import get_current_user
from app.db.session import async_session
from app.services.job_service import JobService
from app.services.user_service import UserService
from app.services.application_service import ApplicationService


# Configuration Dependencies
def settings_dep() -> Settings:
    """Get application settings."""
    return get_settings()


# Database Session Dependencies
async def db_session_dep() -> AsyncGenerator[AsyncSession, None]:
    """Get database session with automatic transaction handling."""
    async with async_session() as session:
        yield session


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """Alias for db_session_dep for consistency."""
    async with async_session() as session:
        yield session


SessionDep = Annotated[AsyncSession, Depends(get_session)]


async def current_user_dep(user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """Get current authenticated user."""
    return user


def get_job_service(session: SessionDep) -> JobService:
    return JobService(session)


def get_user_service(session: SessionDep) -> UserService:

    return UserService(session)


def get_application_service(session: SessionDep) -> ApplicationService:

    return ApplicationService(session)


# Type aliases for service dependencies
JobServiceDep = Annotated[JobService, Depends(get_job_service)]
UserServiceDep = Annotated[UserService, Depends(get_user_service)]
ApplicationServiceDep = Annotated[ApplicationService, Depends(get_application_service)]


# External Service Dependencies
@lru_cache(maxsize=1)
def get_redis_client():
    # TODO: Implement Redis client creation based on settings
    # from redis.asyncio import Redis
    # settings = get_settings()
    # return Redis.from_url(settings.REDIS_URL)
    return None


@lru_cache(maxsize=1)
def get_azure_blob_client():
    # TODO: Implement Azure Blob client creation based on settings
    # from azure.storage.blob import BlobServiceClient
    # settings = get_settings()
    # return BlobServiceClient.from_connection_string(settings.AZURE_BLOB_CONNECTION_STRING)
    return None


RedisDep = Annotated[object, Depends(get_redis_client)]
AzureBlobDep = Annotated[object, Depends(get_azure_blob_client)]


class ServiceContainer:

    def __init__(
        self,
        job_service: JobService,
        user_service: UserService,
        application_service: ApplicationService,
    ):
        self.job_service = job_service
        self.user_service = user_service
        self.application_service = application_service


def get_service_container(
    job_service: JobServiceDep,
    user_service: UserServiceDep,
    application_service: ApplicationServiceDep,
) -> ServiceContainer:
    return ServiceContainer(job_service, user_service, application_service)


ServiceContainerDep = Annotated[ServiceContainer, Depends(get_service_container)]
