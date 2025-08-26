#!/usr/bin/env bash
set -euo pipefail

echo "[prestart] starting prestart steps..."
echo "[prestart] ENV=${ENV:-dev} PORT=${PORT:-8000}"

# --- Wait for Postgres (DATABASE_URL must be set; asyncpg is required) ---
if [[ -n "${DATABASE_URL:-}" ]]; then
  echo "[prestart] waiting for Postgres..."
  python - <<'PY'
import asyncio, os, sys
import asyncpg

async def main():
    dsn = os.environ["DATABASE_URL"]
    try:
        conn = await asyncpg.connect(dsn=dsn, timeout=5)
        try:
            val = await conn.fetchval("SELECT 1")
            print("[prestart] postgres ping:", val)
        finally:
            await conn.close()
    except Exception as e:
        print("[prestart] postgres not ready:", e, file=sys.stderr)
        raise

asyncio.run(main())
PY
else
  echo "[prestart] DATABASE_URL not set; skipping DB wait"
fi

# --- Best effort: wait for Redis ---
if [[ -n "${REDIS_URL:-}" ]]; then
  echo "[prestart] checking Redis..."
  python - <<'PY'
import asyncio, os, sys
try:
    from redis.asyncio import Redis
except Exception:
    print("[prestart] redis library not installed; skipping", file=sys.stderr)
    raise SystemExit(0)

async def main():
    r = Redis.from_url(os.environ["REDIS_URL"], decode_responses=False)
    try:
        pong = await r.ping()
        print("[prestart] redis ping:", pong)
    finally:
        await r.aclose()

asyncio.run(main())
PY
else
  echo "[prestart] REDIS_URL not set; skipping Redis check"
fi

# --- Run DB migrations if alembic.ini is present ---
if [[ -f "alembic.ini" ]]; then
  echo "[prestart] running alembic upgrade head..."
  alembic upgrade head
else
  echo "[prestart] alembic.ini not found; skipping migrations"
fi

echo "[prestart] done."
