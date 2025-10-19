from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status

from app.models.user import User, RefreshToken
from app.models.system import System
from app.schemas.auth import RegisterRequest, LoginRequest, AuthResponse, UserResponse, SystemResponse
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
        result = await self.db.execute(
            select(User).where((User.email == data.email) | (User.username == data.username))
        )
        existing_user = result.scalar_one_or_none()

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email or username already exists"
            )

        result = await self.db.execute(
            select(System).where(System.slug == data.systemSlug)
        )
        system = result.scalar_one_or_none()

        if not system:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid system slug"
            )

        hashed_password = get_password_hash(data.password)

        user = User(
            email=data.email,
            username=data.username,
            password=hashed_password,
            profile_type=data.profileType,
            journey_type=data.journeyType,
            system_id=system.id,
        )

        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)

        result = await self.db.execute(
            select(System).where(System.id == user.system_id)
        )
        user_system = result.scalar_one()

        tokens = await self._generate_tokens(user)
        await self._save_refresh_token(user.id, tokens["refreshToken"])

        return AuthResponse(
            user=UserResponse(
                id=user.id,
                email=user.email,
                username=user.username,
                profileType=user.profile_type,
                journeyType=user.journey_type,
                system=SystemResponse(
                    id=user_system.id,
                    name=user_system.name,
                    slug=user_system.slug,
                )
            ),
            accessToken=tokens["accessToken"],
            refreshToken=tokens["refreshToken"],
        )

    async def login(self, data: LoginRequest) -> AuthResponse:
        result = await self.db.execute(
            select(User).where(User.email == data.email)
        )
        user = result.scalar_one_or_none()

        if not user or not verify_password(data.password, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )

        result = await self.db.execute(
            select(System).where(System.id == user.system_id)
        )
        user_system = result.scalar_one()

        tokens = await self._generate_tokens(user)
        await self._save_refresh_token(user.id, tokens["refreshToken"])

        return AuthResponse(
            user=UserResponse(
                id=user.id,
                email=user.email,
                username=user.username,
                profileType=user.profile_type,
                journeyType=user.journey_type,
                system=SystemResponse(
                    id=user_system.id,
                    name=user_system.name,
                    slug=user_system.slug,
                )
            ),
            accessToken=tokens["accessToken"],
            refreshToken=tokens["refreshToken"],
        )

    async def refresh(self, refresh_token: str) -> AuthResponse:
        result = await self.db.execute(
            select(RefreshToken).where(RefreshToken.token == refresh_token)
        )
        stored_token = result.scalar_one_or_none()

        if not stored_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )

        if stored_token.expires_at < datetime.utcnow():
            await self.db.delete(stored_token)
            await self.db.commit()
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token expired"
            )

        result = await self.db.execute(
            select(User).where(User.id == stored_token.user_id)
        )
        user = result.scalar_one()

        result = await self.db.execute(
            select(System).where(System.id == user.system_id)
        )
        user_system = result.scalar_one()

        tokens = await self._generate_tokens(user)

        await self.db.delete(stored_token)
        await self._save_refresh_token(user.id, tokens["refreshToken"])
        await self.db.commit()

        return AuthResponse(
            user=UserResponse(
                id=user.id,
                email=user.email,
                username=user.username,
                profileType=user.profile_type,
                journeyType=user.journey_type,
                system=SystemResponse(
                    id=user_system.id,
                    name=user_system.name,
                    slug=user_system.slug,
                )
            ),
            accessToken=tokens["accessToken"],
            refreshToken=tokens["refreshToken"],
        )

    async def logout(self, user_id: str) -> dict:
        result = await self.db.execute(
            select(RefreshToken).where(RefreshToken.user_id == user_id)
        )
        tokens = result.scalars().all()

        for token in tokens:
            await self.db.delete(token)

        await self.db.commit()
        return {"message": "Logged out successfully"}

    async def _generate_tokens(self, user: User) -> dict:
        access_expires = parse_expires_in(settings.JWT_EXPIRES_IN)
        refresh_expires = parse_expires_in(settings.REFRESH_TOKEN_EXPIRES_IN)

        access_token = create_access_token(
            data={"sub": user.id, "email": user.email, "systemId": user.system_id},
            expires_delta=access_expires
        )

        refresh_token = create_refresh_token(
            data={"sub": user.id, "email": user.email, "systemId": user.system_id},
            expires_delta=refresh_expires
        )

        return {
            "accessToken": access_token,
            "refreshToken": refresh_token,
        }

    async def _save_refresh_token(self, user_id: str, token: str):
        expires_in = parse_expires_in(settings.REFRESH_TOKEN_EXPIRES_IN)
        expiration_date = datetime.utcnow() + expires_in

        refresh_token = RefreshToken(
            user_id=user_id,
            token=token,
            expires_at=expiration_date,
        )

        self.db.add(refresh_token)
        await self.db.commit()
