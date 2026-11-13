from fastapi.testclient import TestClient

from app.main import app

klien = TestClient(app)


def test_kesehatan():
    r = klien.get("/api/kesehatan")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_versi_konten():
    r = klien.get("/api/konten/versi")
    assert r.status_code == 200
    assert "versi" in r.json()
