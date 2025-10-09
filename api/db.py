import asyncpg
import os

DATABASE_URL = os.getenv("DATABASE_URL")
_pool: asyncpg.Pool | None = None


async def init_db():
    global _pool
    _pool = await asyncpg.create_pool(DATABASE_URL)

async def close_db():
    if _pool:
        await _pool.close()

async def get_pool() -> asyncpg.Pool:
    if not _pool:
        raise RuntimeError("Database pool not initialized")
    return _pool
