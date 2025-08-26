from __future__ import annotations

import json
import os
from typing import Any, Optional

from redis.asyncio import Redis

_redis: Optional[Redis] = None


def get_redis() -> Redis:
    global _redis
    if _redis is None:
        url = os.getenv("REDIS_URL")
        if not url:
            raise RuntimeError("REDIS_URL is not set")
        # decode_responses=False to return bytes; we encode/decode ourselves for json/text safety
        _redis = Redis.from_url(url, decode_responses=False)
    return _redis


async def close_redis() -> None:
    global _redis
    if _redis:
        await _redis.aclose()
        _redis = None


async def cache_set(key: str, value: bytes | str, *, ttl: int | None = None) -> None:
    r = get_redis()
    data = value.encode("utf-8") if isinstance(value, str) else value
    if ttl:
        await r.set(key, data, ex=ttl)
    else:
        await r.set(key, data)


async def cache_get(key: str) -> bytes | None:
    r = get_redis()
    return await r.get(key)


async def cache_json_set(key: str, obj: Any, *, ttl: int | None = None) -> None:
    data = json.dumps(obj, ensure_ascii=False).encode("utf-8")
    await cache_set(key, data, ttl=ttl)


async def cache_json_get(key: str) -> Any | None:
    data = await cache_get(key)
    if data is None:
        return None
    try:
        return json.loads(data.decode("utf-8"))
    except Exception:
        return None
