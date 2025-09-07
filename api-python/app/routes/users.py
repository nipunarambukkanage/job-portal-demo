from __future__ import annotations

import uuid
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, status, Header
from sqlalchemy.exc import IntegrityError

from app.db.session import async_session
from app.repositories.user_repo import (
    create_user,
    ensure_user,
    get_user_by_email,
    get_user_by_id,
    list_users,
    update_user,
)
from app.schemas.user import UserCreate, UserRead, UserUpdate

router = APIRouter()

# GET /v1/users  -> list all (paged)
@router.get("", response_model=list[UserRead], summary="List users")
async def list_users_endpoint(
    page: int = Query(1, ge=1),
    size: int = Query(50, ge=1, le=200),
):
    async with async_session() as session:
        items, _total = await list_users(session, page=page, size=size)
        return items

# POST /v1/users -> create
@router.post("", response_model=UserRead, status_code=status.HTTP_201_CREATED, summary="Create a user")
async def create_user_endpoint(
    payload: UserCreate,
    x_external_user_id: str | None = Header(default=None, alias="X-External-User-Id"),
):
    # optional override if Clerk id is a valid UUID
    id_override: uuid.UUID | None = None
    if x_external_user_id:
        try:
            id_override = uuid.UUID(x_external_user_id)
        except ValueError:
            id_override = None

    async with async_session() as session:
        try:
            obj = await create_user(
                session,
                email=str(payload.email),
                full_name=payload.full_name,
                role=payload.role,
                headline=payload.headline,
                about=payload.about,
                id_override=id_override,  # <-- only used if valid UUID
            )
            await session.commit()
            return obj
        except IntegrityError:
            await session.rollback()
            raise HTTPException(status_code=409, detail="A user with this email already exists.")

# GET /v1/users/by-email?email=... -> by email (put this BEFORE /{user_id})
@router.get("/by-email", response_model=UserRead, summary="Get user by email")
async def get_user_by_email_endpoint(email: str = Query(..., min_length=3, max_length=320)):
    async with async_session() as session:
        obj = await get_user_by_email(session, email)
        if not obj:
            raise HTTPException(status_code=404, detail="User not found.")
        return obj

# GET /v1/users/{user_id} -> by id
@router.get("/{user_id}", response_model=UserRead, summary="Get user by id")
async def get_user_endpoint(user_id: UUID):
    async with async_session() as session:
        obj = await get_user_by_id(session, user_id)
        if not obj:
            raise HTTPException(status_code=404, detail="User not found.")
        return obj

# PATCH /v1/users/{user_id} -> partial update
@router.patch("/{user_id}", response_model=UserRead, summary="Update user (partial)")
async def update_user_endpoint(user_id: UUID, payload: UserUpdate):
    async with async_session() as session:
        current = await get_user_by_id(session, user_id)
        if not current:
            raise HTTPException(status_code=404, detail="User not found.")

        try:
            obj = await update_user(
                session,
                user_id,
                full_name=payload.full_name,
                role=payload.role,
                headline=payload.headline,
                about=payload.about,
            )
            await session.commit()
            return obj
        except IntegrityError:
            await session.rollback()
            raise HTTPException(status_code=409, detail="Email already in use.")

# POST /v1/users/ensure -> create if missing, else patch with provided fields
@router.post("/ensure", response_model=UserRead, summary="Ensure a user exists by email")
async def ensure_user_endpoint(
    payload: UserCreate,
    x_external_user_id: str | None = Header(default=None, alias="X-External-User-Id"),
):
    id_override: uuid.UUID | None = None
    if x_external_user_id:
        try:
            id_override = uuid.UUID(x_external_user_id)
        except ValueError:
            id_override = None

    async with async_session() as session:
        obj = await ensure_user(
            session,
            email=str(payload.email),
            defaults={
                "full_name": payload.full_name,
                "role": payload.role,
                "headline": payload.headline,
                "about": payload.about,
            },
            id_override=id_override,
        )
        await session.commit()
        return obj
