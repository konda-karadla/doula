from datetime import datetime, timedelta, timezone
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
import secrets

from app.shared.models import User, RefreshToken
from app.shared.models import System
from app.domains.auth.schemas.auth import RegisterRequest, LoginRequest, AuthResponse, UserResponse, SystemResponse
from app.core.security import (
    verify_password, 
    get_password_hash, 
    create_access_token, 
    create_refresh_token,
    decode_refresh_token,
    parse_expires_in
)
from app.core.config import settings


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def register(self, data: RegisterRequest) -> AuthResponse:
        # Check if user already exists
        result = await self.db.execute(
            select(User).where(User.email == data.email)
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Check if username already exists
        result = await self.db.execute(
            select(User).where(User.username == data.username)
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )

        # Get system by slug
        result = await self.db.execute(
            select(System).where(System.slug == data.systemSlug)
        )
        system = result.scalar_one_or_none()
        if not system:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid system"
            )

        # Create new user
        hashed_password = get_password_hash(data.password)
        user = User(
            email=data.email,
            username=data.username,
            password=hashed_password,
            profile_type=data.profileType,
            journey_type=data.journeyType,
            system_id=system.id
        )

        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)

        # Create tokens
        access_token = create_access_token(
            {"sub": user.id, "email": user.email},
            expires_delta=parse_expires_in(settings.JWT_EXPIRES_IN)
        )
        
        refresh_token = create_refresh_token(
            {"sub": user.id},
            expires_delta=parse_expires_in(settings.REFRESH_TOKEN_EXPIRES_IN)
        )

        # Store refresh token
        refresh_token_obj = RefreshToken(
            user_id=user.id,
            token=refresh_token,
            expires_at=datetime.now(timezone.utc) + parse_expires_in(settings.REFRESH_TOKEN_EXPIRES_IN)
        )
        self.db.add(refresh_token_obj)
        await self.db.commit()

        return AuthResponse(
            user=UserResponse(
                id=user.id,
                email=user.email,
                username=user.username,
                role=user.role,
                profile_type=user.profile_type,
                journey_type=user.journey_type,
                system=SystemResponse(
                    id=system.id,
                    name=system.name,
                    slug=system.slug
                )
            ),
            accessToken=access_token,
            refreshToken=refresh_token
        )

    async def login(self, data: LoginRequest) -> AuthResponse:
        # Find user by email
        result = await self.db.execute(
            select(User).where(User.email == data.email)
        )
        user = result.scalar_one_or_none()
        
        if not user or not verify_password(data.password, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        # Get system
        result = await self.db.execute(
            select(System).where(System.id == user.system_id)
        )
        system = result.scalar_one_or_none()
        if not system:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="System not found"
            )

        # Create tokens
        access_token = create_access_token(
            {"sub": user.id, "email": user.email},
            expires_delta=parse_expires_in(settings.JWT_EXPIRES_IN)
        )
        
        refresh_token = create_refresh_token(
            {"sub": user.id},
            expires_delta=parse_expires_in(settings.REFRESH_TOKEN_EXPIRES_IN)
        )

        # Store refresh token
        refresh_token_obj = RefreshToken(
            user_id=user.id,
            token=refresh_token,
            expires_at=datetime.now(timezone.utc) + parse_expires_in(settings.REFRESH_TOKEN_EXPIRES_IN)
        )
        self.db.add(refresh_token_obj)
        await self.db.commit()

        return AuthResponse(
            user=UserResponse(
                id=user.id,
                email=user.email,
                username=user.username,
                role=user.role,
                profile_type=user.profile_type,
                journey_type=user.journey_type,
                system=SystemResponse(
                    id=system.id,
                    name=system.name,
                    slug=system.slug
                )
            ),
            accessToken=access_token,
            refreshToken=refresh_token
        )

    async def refresh(self, refresh_token: str) -> AuthResponse:
        # Decode refresh token
        payload = decode_refresh_token(refresh_token)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )

        # Check if refresh token exists in database
        result = await self.db.execute(
            select(RefreshToken).where(RefreshToken.token == refresh_token)
        )
        stored_token = result.scalar_one_or_none()
        
        if not stored_token or stored_token.expires_at < datetime.now(timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token"
            )

        # Get user
        result = await self.db.execute(
            select(User).where(User.id == stored_token.user_id)
        )
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )

        # Get system
        result = await self.db.execute(
            select(System).where(System.id == user.system_id)
        )
        system = result.scalar_one_or_none()
        if not system:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="System not found"
            )

        # Create new access token
        access_token = create_access_token(
            {"sub": user.id, "email": user.email},
            expires_delta=parse_expires_in(settings.JWT_EXPIRES_IN)
        )

        return AuthResponse(
            user=UserResponse(
                id=user.id,
                email=user.email,
                username=user.username,
                role=user.role,
                profile_type=user.profile_type,
                journey_type=user.journey_type,
                system=SystemResponse(
                    id=system.id,
                    name=system.name,
                    slug=system.slug
                )
            ),
            accessToken=access_token,
            refreshToken=refresh_token
        )

    async def logout(self, user_id: str) -> dict:
        # Remove all refresh tokens for the user
        result = await self.db.execute(
            select(RefreshToken).where(RefreshToken.user_id == user_id)
        )
        tokens = result.scalars().all()
        
        for token in tokens:
            await self.db.delete(token)
        
        await self.db.commit()
        
        return {"message": "Logged out successfully"}
