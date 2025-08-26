from __future__ import annotations


def test_resume_ingest_accepts_and_echoes(client):
    # Our route expects 'blob_url' as a query/body param; using query for simplicity
    blob = "https://account.blob.core.windows.net/container/resume.pdf?sig=xyz"
    r = client.post("/v1/resumes/ingest", params={"blob_url": blob})
    assert r.status_code == 200
    body = r.json()
    assert body["message"] == "ingest accepted"
    assert body["blob_url"] == blob
    assert body["requested_by"] == "user_test_123"
