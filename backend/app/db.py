"""Koneksi basis data (SQLite untuk uji coba kecil, PostgreSQL untuk produksi)."""
from collections.abc import Iterator

from sqlmodel import Session, SQLModel, create_engine

from .config import pengaturan


def buat_engine(url: str):
    argumen = {"check_same_thread": False} if url.startswith("sqlite") else {}
    return create_engine(url, connect_args=argumen)


engine = buat_engine(pengaturan.database_url)


def siapkan_db(e=None) -> None:
    from . import models  # noqa: F401 — mendaftarkan tabel

    SQLModel.metadata.create_all(e or engine)


def get_session() -> Iterator[Session]:
    with Session(engine) as sesi:
        yield sesi
