from __future__ import annotations

import os
import pytest
from fastapi.testclient import TestClient

from app.main import create_app
from app.routes import auth as auth_routes


@pytest.fixture(scope="session")
def app():
    os.environ.setdefault(
        "CORS_ORIGINS",
        "http://localhost:5173,https://jobportal971778.z29.web.core.windows.net,https://jobportal.nipunarambukkanage.dev",
    )
    return create_app()


@pytest.fixture()
def client(app):
    async def _fake_current_user():
        return {
            "sub": "user_test_123",
            "email_addresses": ["tester@example.com"],
            "iss": "https://trusted-swan-44.clerk.accounts.dev",
            "aud": "jobportal-api",
        }

    app.dependency_overrides[auth_routes.get_current_user] = _fake_current_user
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
