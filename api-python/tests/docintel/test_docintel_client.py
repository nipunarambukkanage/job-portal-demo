from __future__ import annotations

import asyncio

import pytest

from app.integrations.azure_docintel import AzureDocIntelClient


@pytest.mark.asyncio
async def test_docintel_client_analyze_url_success(monkeypatch):
    """
    Mock httpx.AsyncClient so we never hit the network.
    """

    class _Resp:
        def __init__(self, status_code=200, headers=None, json_data=None):
            self.status_code = status_code
            self.headers = headers or {}
            self._json = json_data or {}

        def raise_for_status(self):
            if self.status_code >= 400:
                raise RuntimeError(f"HTTP {self.status_code}")

        def json(self):
            return self._json

    class _DummyClient:
        def __init__(self, *a, **kw):
            self._polls = 0

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            return False

        async def post(self, url, headers=None, json=None):
            return _Resp(
                200,
                headers={"operation-location": "https://op/status/123"},
                json_data={"ok": True},
            )

        async def get(self, url, headers=None):
            self._polls += 1
            if self._polls < 2:
                return _Resp(200, json_data={"status": "running"})
            return _Resp(200, json_data={"status": "succeeded", "documents": [{"fields": {}}]})

    monkeypatch.setattr("httpx.AsyncClient", _DummyClient, raising=True)

    client = AzureDocIntelClient(
        endpoint="https://example.cognitiveservices.azure.com",
        key="dummy",
        model_id="prebuilt-resume",
        api_version="2024-07-31",
        poll_seconds=0,         # no sleep
        poll_attempts=3,
    )

    out = await client.analyze_url("https://blob/resume.pdf")
    assert out["status"] == "succeeded"
    assert "documents" in out
