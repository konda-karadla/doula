import asyncio
from sqlalchemy import text
from app.core.database import engine

async def main():
	async with engine.connect() as conn:
		res = await conn.execute(text("SELECT 1"))
		print("SELECT1:", res.scalar())
	await engine.dispose()

if __name__ == "__main__":
	asyncio.run(main())
