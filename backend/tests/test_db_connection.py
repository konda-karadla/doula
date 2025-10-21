import pytest
from sqlalchemy import text
from app.core.database import engine


@pytest.mark.asyncio
async def test_db_connectivity_engine_direct():
	async with engine.connect() as conn:
		result = await conn.execute(text("SELECT 1"))
		row = result.fetchone()
		assert row is not None and row[0] == 1
