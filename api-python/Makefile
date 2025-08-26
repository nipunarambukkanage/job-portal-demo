SHELL := /bin/bash

.PHONY: help
help:
	@echo "Targets:"
	@echo "  venv            Create virtualenv"
	@echo "  install         Install project (incl. dev deps)"
	@echo "  run             Run API locally (uvicorn --reload)"
	@echo "  worker          Run Celery worker"
	@echo "  lint            Ruff lint"
	@echo "  fmt             Ruff format (--fix)"
	@echo "  test            Run pytest"
	@echo "  alembic-init    Init Alembic (async template)"
	@echo "  alembic-rev     Autogenerate migration"
	@echo "  alembic-up      Upgrade to head"
	@echo "  compose-up      docker compose up (dev)"
	@echo "  compose-down    docker compose down -v"
	@echo "  seed            Seed dev data"

venv:
	python -m venv .venv

install:
	pip install --upgrade pip
	pip install -e ".[dev]"

run:
	uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

worker:
	celery -A app.workers.celery_app.celery_app worker -Q default -l INFO

lint:
	ruff check .

fmt:
	ruff check . --fix

test:
	pytest -q

alembic-init:
	alembic init -t async migrations

alembic-rev:
	alembic revision --autogenerate -m "auto"

alembic-up:
	alembic upgrade head

compose-up:
	docker compose -f docker-compose.dev.yml up --build

compose-down:
	docker compose -f docker-compose.dev.yml down -v

seed:
	python scripts/seed_dev.py
