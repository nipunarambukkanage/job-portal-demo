from __future__ import annotations

import uuid
import types

from app.workers.resume_tasks import parse_resume_task


def test_parse_resume_task_synchronous_call(monkeypatch):
    """
    We call the Celery task function directly (sync) and mock:
      - async_session -> dummy context manager (no DB)
      - parse_resume_via_docintel -> deterministic fake coroutine
    """

    # 1) Fake async session context manager (to avoid DB)
    class _DummySession:
        async def commit(self): ...
        async def rollback(self): ...
        async def close(self): ...

    class _DummyCtx:
        async def __aenter__(self):
            return _DummySession()
        async def __aexit__(self, exc_type, exc, tb):
            return False

    def _dummy_async_session():
        return _DummyCtx()

    monkeypatch.setattr("app.workers.resume_tasks.async_session", _dummy_async_session, raising=True)

    # 2) Fake parsing pipeline (no network)
    async def _fake_parse(session, *, resume_id, blob_sas_url):
        return (
            {"status": "succeeded", "documents": []},
            {"full_name": "Jane Doe", "skills": ["python", "fastapi"]},
        )

    monkeypatch.setattr(
        "app.workers.resume_tasks.parse_resume_via_docintel",
        _fake_parse,
        raising=True,
    )

    rid = str(uuid.uuid4())
    out = parse_resume_task(rid, "https://example.com/blob.pdf?sas=1")
    assert out["normalized"]["full_name"] == "Jane Doe"
    assert "python" in out["normalized"]["skills"]
