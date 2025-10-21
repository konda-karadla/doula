from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.engine import make_url
from sqlalchemy.orm import declarative_base
from typing import AsyncGenerator
import ssl

from core.config import settings

# Convert database URL to asyncpg format and remove sslmode parameter
database_url = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

# Remove sslmode query parameter as asyncpg handles SSL differently
if "?sslmode=" in database_url:
    database_url = database_url.split("?sslmode=")[0]

url = make_url(database_url)

engine_kwargs = {
    "echo": False,
    "pool_pre_ping": True,
}

# Add SSL context for asyncpg (PostgreSQL connections)
if url.get_backend_name() == "postgresql":
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    engine_kwargs["connect_args"] = {"ssl": ssl_context}

if url.get_backend_name() not in {"sqlite", "sqlite+aiosqlite"}:
    engine_kwargs.update({
        "pool_size": 10,
        "max_overflow": 20,
    })

engine = create_async_engine(
    database_url,
    **engine_kwargs,
)

async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

Base = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()
