"""Pengaturan aplikasi, dibaca dari variabel lingkungan (atau file .env)."""
import os
from dataclasses import dataclass, field
from pathlib import Path

from dotenv import load_dotenv

AKAR_BACKEND = Path(__file__).resolve().parent.parent
load_dotenv(AKAR_BACKEND / ".env")


def _daftar(nilai: str) -> list[str]:
    return [s.strip() for s in nilai.split(",") if s.strip()]


@dataclass(frozen=True)
class Pengaturan:
    secret_key: str = os.getenv("SECRET_KEY", "ganti-di-produksi")
    database_url: str = os.getenv("DATABASE_URL", f"sqlite:///{AKAR_BACKEND / 'tandatepat.db'}")
    cors_origins: list[str] = field(
        default_factory=lambda: _daftar(os.getenv("CORS_ORIGINS", "http://localhost:5173"))
    )
    frontend_dist: Path = Path(
        os.getenv("FRONTEND_DIST", str(AKAR_BACKEND.parent / "frontend" / "dist"))
    )


pengaturan = Pengaturan()
