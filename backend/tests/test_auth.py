import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.shared.system_models import System
from app.domains.auth.models import User
from core.security import get_password_hash


@pytest.mark.asyncio
async def test_register_user(client: AsyncClient, db_session: AsyncSession):
    system = System(
        name="Test System",
        slug="test-system"
    )
    db_session.add(system)
    await db_session.commit()

    response = await client.post(
        "/auth/register",
        json={
            "email": "test@example.com",
            "username": "testuser",
            "password": "testpassword123",
            "profileType": "patient",
            "journeyType": "functional_health",
            "systemSlug": "test-system"
        }
    )

    assert response.status_code == 201
    data = response.json()
    assert data["user"]["email"] == "test@example.com"
    assert data["user"]["username"] == "testuser"
    assert "accessToken" in data
    assert "refreshToken" in data


@pytest.mark.asyncio
async def test_login_user(client: AsyncClient, db_session: AsyncSession):
    system = System(name="Test System", slug="test-system")
    db_session.add(system)
    await db_session.commit()
    await db_session.refresh(system)

    user = User(
        email="test@example.com",
        username="testuser",
        password=get_password_hash("testpassword123"),
        profile_type="patient",
        journey_type="functional_health",
        system_id=system.id
    )
    db_session.add(user)
    await db_session.commit()

    response = await client.post(
        "/auth/login",
        json={
            "email": "test@example.com",
            "password": "testpassword123"
        }
    )

    assert response.status_code == 200
    data = response.json()
    assert data["user"]["email"] == "test@example.com"
    assert "accessToken" in data
    assert "refreshToken" in data


@pytest.mark.asyncio
async def test_login_invalid_credentials(client: AsyncClient, db_session: AsyncSession):
    response = await client.post(
        "/auth/login",
        json={
            "email": "nonexistent@example.com",
            "password": "wrongpassword"
        }
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient, db_session: AsyncSession):
    system = System(name="Test System", slug="test-system")
    db_session.add(system)
    await db_session.commit()
    await db_session.refresh(system)

    user = User(
        email="test@example.com",
        username="testuser",
        password=get_password_hash("testpassword123"),
        profile_type="patient",
        journey_type="functional_health",
        system_id=system.id
    )
    db_session.add(user)
    await db_session.commit()

    response = await client.post(
        "/auth/register",
        json={
            "email": "test@example.com",
            "username": "newuser",
            "password": "testpassword123",
            "profileType": "patient",
            "journeyType": "functional_health",
            "systemSlug": "test-system"
        }
    )

    assert response.status_code == 409
    assert "already exists" in response.json()["detail"]
