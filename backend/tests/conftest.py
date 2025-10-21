import pytest
import pytest_asyncio
import asyncio
from typing import AsyncGenerator
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from main import app
from core.database import Base, get_db
from core.config import settings

# Import all domain models to ensure they're registered with metadata
from models.user import User
from models.system import System
from models.consultation import Doctor, Consultation
from models.lab_result import LabResult, Biomarker
from models.action_plan import ActionPlan, ActionItem


@pytest_asyncio.fixture(scope="session")
async def test_engine():
    """Create a test-specific async engine bound to pytest's event loop."""
    database_url = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://").replace("?sslmode=require", "")
    engine = create_async_engine(database_url, poolclass=NullPool, echo=False)
    
    # Create tables once
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield engine
    
    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def db_session(test_engine) -> AsyncGenerator[AsyncSession, None]:
    # Create a session from the test engine
    async_session_factory = async_sessionmaker(bind=test_engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session_factory() as session:
        try:
            yield session
        finally:
            await session.rollback()
            await session.close()


# Seed data is intentionally omitted; individual tests create what they need


@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()
