"""
User Service Layer

Encapsulates business logic for user operations, coordinating between
repositories and providing a clean interface for route handlers.
"""
from __future__ import annotations

import uuid
from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User, UserRole
from app.repositories import user_repo
from app.core.exceptions import (
    UserNotFoundError,
    InvalidUserDataError,
    DuplicateUserError,
)


class UserService:
    """Service for user-related business operations."""
    
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def create_user(
        self,
        *,
        external_id: str,
        email: str,
        first_name: str | None = None,
        last_name: str | None = None,
        role: UserRole = UserRole.candidate,
        org_id: uuid.UUID | None = None,
    ) -> User:
        """
        Create a new user.
        
        Args:
            external_id: External system ID (e.g., from Clerk)
            email: User's email address
            first_name: User's first name
            last_name: User's last name
            role: User's role (default: candidate)
            org_id: Organization ID (for org members)
            
        Returns:
            Created User instance
            
        Raises:
            InvalidUserDataError: If user data is invalid
            DuplicateUserError: If user already exists
        """
        # Validate required fields
        if not external_id or not external_id.strip():
            raise InvalidUserDataError("External ID is required")
        
        if not email or not email.strip():
            raise InvalidUserDataError("Email is required")
        
        # Clean data
        external_id = external_id.strip()
        email = email.strip().lower()
        first_name = first_name.strip() if first_name else None
        last_name = last_name.strip() if last_name else None
        
        # Validate org membership for non-candidates
        if role != UserRole.candidate and not org_id:
            raise InvalidUserDataError(f"Organization ID required for role: {role}")
        
        try:
            # Check if user already exists
            existing_user = await user_repo.get_user_by_external_id(self.session, external_id)
            if existing_user:
                raise DuplicateUserError(f"User with external ID {external_id} already exists")
            
            existing_email = await user_repo.get_user_by_email(self.session, email)
            if existing_email:
                raise DuplicateUserError(f"User with email {email} already exists")
            
            user = await user_repo.create_user(
                self.session,
                external_id=external_id,
                email=email,
                first_name=first_name,
                last_name=last_name,
                role=role,
                org_id=org_id,
            )
            await self.session.flush()
            return user
        except (DuplicateUserError, InvalidUserDataError):
            raise
        except Exception as e:
            raise InvalidUserDataError(f"Failed to create user: {str(e)}") from e
    
    async def get_user(self, user_id: uuid.UUID) -> User:
        """
        Get a user by ID.
        
        Args:
            user_id: UUID of the user to retrieve
            
        Returns:
            User instance
            
        Raises:
            UserNotFoundError: If user doesn't exist
        """
        user = await user_repo.get_user(self.session, user_id)
        if not user:
            raise UserNotFoundError(f"User with ID {user_id} not found")
        return user
    
    async def get_user_by_external_id(self, external_id: str) -> User:
        """
        Get a user by external ID.
        
        Args:
            external_id: External system ID to look up
            
        Returns:
            User instance
            
        Raises:
            UserNotFoundError: If user doesn't exist
        """
        user = await user_repo.get_user_by_external_id(self.session, external_id)
        if not user:
            raise UserNotFoundError(f"User with external ID {external_id} not found")
        return user
    
    async def get_user_by_email(self, email: str) -> User:
        """
        Get a user by email.
        
        Args:
            email: Email address to look up
            
        Returns:
            User instance
            
        Raises:
            UserNotFoundError: If user doesn't exist
        """
        email = email.strip().lower()
        user = await user_repo.get_user_by_email(self.session, email)
        if not user:
            raise UserNotFoundError(f"User with email {email} not found")
        return user
    
    async def update_user(
        self,
        user_id: uuid.UUID,
        *,
        email: str | None = None,
        first_name: str | None = None,
        last_name: str | None = None,
        role: UserRole | None = None,
        org_id: uuid.UUID | None = None,
    ) -> User:
        """
        Update an existing user.
        
        Args:
            user_id: UUID of the user to update
            email: New email address
            first_name: New first name
            last_name: New last name
            role: New user role
            org_id: New organization ID
            
        Returns:
            Updated User instance
            
        Raises:
            UserNotFoundError: If user doesn't exist
            InvalidUserDataError: If update data is invalid
            DuplicateUserError: If email conflicts with existing user
        """
        # First check if user exists
        user = await self.get_user(user_id)
        
        # Validate and clean data
        update_data = {}
        
        if email is not None:
            email = email.strip().lower()
            if not email:
                raise InvalidUserDataError("Email cannot be empty")
            
            # Check for email conflicts (excluding current user)
            existing_email = await user_repo.get_user_by_email(self.session, email)
            if existing_email and existing_email.id != user_id:
                raise DuplicateUserError(f"Email {email} is already in use")
            
            update_data["email"] = email
        
        if first_name is not None:
            update_data["first_name"] = first_name.strip() if first_name else None
        
        if last_name is not None:
            update_data["last_name"] = last_name.strip() if last_name else None
        
        if role is not None:
            # Validate org membership for non-candidates
            if role != UserRole.candidate and not (user.org_id or org_id):
                raise InvalidUserDataError(f"Organization ID required for role: {role}")
            update_data["role"] = role
        
        if org_id is not None:
            update_data["org_id"] = org_id
        
        if not update_data:
            return user  # No changes to make
        
        try:
            rows_affected = await user_repo.update_user(self.session, user_id=user_id, **update_data)
            if rows_affected == 0:
                raise UserNotFoundError(f"User with ID {user_id} not found")
            
            await self.session.flush()
            # Return the updated user
            return await self.get_user(user_id)
        except (UserNotFoundError, InvalidUserDataError, DuplicateUserError):
            raise
        except Exception as e:
            raise InvalidUserDataError(f"Failed to update user: {str(e)}") from e
    
    async def list_users_by_org(
        self,
        org_id: uuid.UUID,
        *,
        role: UserRole | None = None,
        page: int = 1,
        size: int = 20,
    ) -> tuple[List[User], int]:
        """
        List users in an organization.
        
        Args:
            org_id: Organization ID to filter by
            role: Optional role filter
            page: Page number (1-based)
            size: Page size (1-100)
            
        Returns:
            Tuple of (users list, total count)
        """
        # Validate pagination
        page = max(1, page)
        size = max(1, min(100, size))
        
        return await user_repo.list_users_by_org(
            self.session,
            org_id=org_id,
            role=role,
            page=page,
            size=size,
        )
    
    async def deactivate_user(self, user_id: uuid.UUID) -> User:
        """
        Deactivate a user account.
        
        Args:
            user_id: UUID of the user to deactivate
            
        Returns:
            Deactivated User instance
            
        Raises:
            UserNotFoundError: If user doesn't exist
        """
        # First check if user exists
        user = await self.get_user(user_id)
        
        rows_affected = await user_repo.deactivate_user(self.session, user_id)
        if rows_affected == 0:
            raise UserNotFoundError(f"User with ID {user_id} not found")
        
        await self.session.flush()
        return await self.get_user(user_id)
