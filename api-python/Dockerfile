# ===== Base =====
FROM python:3.12-slim AS base
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq5 curl ca-certificates bash git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ===== deps (cache) =====
COPY pyproject.toml README.md /app/
RUN pip install --upgrade pip && pip install -e ".[dev]"

# ===== app =====
COPY . /app

# Make prestart executable if not already
RUN chmod +x scripts/prestart.sh || true

EXPOSE 8000
ENV ENV=container LOG_LEVEL=INFO

# Healthcheck: simple TCP connect
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
 CMD curl -fsS http://localhost:8000/health || exit 1

CMD ["bash", "-lc", "scripts/prestart.sh && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"]
