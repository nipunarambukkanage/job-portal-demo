#!/usr/bin/env bash
set -Eeuo pipefail

echo "[prestart] starting prestart steps..."
echo "[prestart] ENV=${ENV:-dev} PORT=${PORT:-8000}"

# ---------- Wait for Postgres (non-fatal) ----------
if [[ -n "${DATABASE_URL:-}" || -n "${POSTGRES_DSN:-}" ]]; then
  echo "[prestart] checking Postgres connectivity..."
  set +e
  python - <<'PY'
import os, sys, asyncio
try:
    import asyncpg
except Exception as e:
    print("[prestart] asyncpg not installed; skipping DB ping", file=sys.stderr)
    raise SystemExit(0)

# Prefer explicit asyncpg DSN; otherwise derive from DATABASE_URL
dsn = os.getenv("POSTGRES_DSN") or os.getenv("DATABASE_URL") or ""
if dsn.startswith("postgresql+asyncpg://"):
    dsn = dsn.replace("postgresql+asyncpg://", "postgresql://", 1)

# Heuristic TLS: DO uses 25060; also handle sqlmode=require in URL
ssl_flag = None
if ":25060" in dsn or "sslmode=require" in dsn or ".ondigitalocean.com" in dsn:
    ssl_flag = True

async def main():
    try:
        conn = await asyncpg.connect(dsn=dsn, timeout=5, ssl=ssl_flag)
        val = await conn.fetchval("SELECT 1")
        await conn.close()
        print("[prestart] postgres ping ok:", val)
    except Exception as e:
        print("[prestart] postgres not ready:", e, file=sys.stderr)

asyncio.run(main())
PY
  rc=$?
  set -e
  if [[ $rc -ne 0 ]]; then
    echo "[prestart] DB ping script exited with code $rc (continuing)"
  fi
else
  echo "[prestart] DATABASE_URL/POSTGRES_DSN not set; skipping DB ping"
fi

# ---------- Redis ping (non-fatal) ----------
if [[ -n "${REDIS_URL:-}" ]]; then
  echo "[prestart] checking Redis..."
  set +e
  python - <<'PY'
import os, sys, asyncio
try:
    from redis.asyncio import Redis
except Exception:
    print("[prestart] redis library not installed; skipping", file=sys.stderr)
    raise SystemExit(0)

async def main():
    try:
        r = Redis.from_url(os.environ["REDIS_URL"], decode_responses=False)
        pong = await r.ping()
        print("[prestart] redis ping:", pong)
        await r.aclose()
    except Exception as e:
        print("[prestart] redis not ready:", e, file=sys.stderr)

asyncio.run(main())
PY
  rc=$?
  set -e
  if [[ $rc -ne 0 ]]; then
    echo "[prestart] Redis check exited with code $rc (continuing)"
  fi
else
  echo "[prestart] REDIS_URL not set; skipping Redis check"
fi

# ---------- Alembic (best-effort) ----------
if [[ -f "alembic.ini" ]]; then
  echo "[prestart] running alembic upgrade head (best-effort)..."
  set +e
  alembic upgrade head
  rc=$?
  set -e
  if [[ $rc -ne 0 ]]; then
    echo "[prestart] alembic failed with code $rc (continuing)"
  fi
else
  echo "[prestart] alembic.ini not found; skipping migrations"
fi

echo "[prestart] done."
