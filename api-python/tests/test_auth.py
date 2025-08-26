from __future__ import annotations


def test_auth_verify(client):
    r = client.get("/auth/verify")
    assert r.status_code == 200
    body = r.json()
    assert body["sub"] == "user_test_123"
    assert body["aud"] == "jobportal-api"
