"""Setiap tes memakai basis data SQLite di memori yang baru."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, create_engine

from app.db import get_session, siapkan_db
from app.main import app
from app.security import reset_batas


@pytest.fixture
def klien():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    siapkan_db(engine)

    def sesi_uji():
        with Session(engine) as s:
            yield s

    app.dependency_overrides[get_session] = sesi_uji
    reset_batas()
    with TestClient(app) as k:
        yield k
    app.dependency_overrides.clear()


def auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def guru(klien):
    r = klien.post("/api/auth/guru/daftar", json={"nama": "Bu Guru", "email": "guru@contoh.id", "sandi": "rahasia123"})
    return r.json()


@pytest.fixture
def kelas(klien, guru):
    return klien.post("/api/kelas", json={"nama": "IX-A"}, headers=auth(guru["token"])).json()


@pytest.fixture
def siswa(klien, kelas):
    return klien.post(
        "/api/auth/siswa/gabung", json={"kode_kelas": kelas["kode"], "nama_panggilan": "Nadia", "pin": "1234"}
    ).json()
