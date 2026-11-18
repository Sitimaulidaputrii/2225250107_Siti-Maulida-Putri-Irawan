"""Tabel basis data (dokumen 07 §7.5). Siswa disimpan dengan pseudonim — tanpa data pribadi."""
import json
from datetime import UTC, datetime

from sqlalchemy import UniqueConstraint
from sqlmodel import Field, SQLModel

PENGATURAN_KELAS_BAWAAN = {"promptPenjelasan": True, "skalaBeban": False}


def sekarang() -> datetime:
    return datetime.now(UTC)


class Guru(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True, max_length=254)
    hash_sandi: str
    nama: str = Field(max_length=80)
    dibuat: datetime = Field(default_factory=sekarang)


class Kelas(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    guru_id: int = Field(foreign_key="guru.id", index=True)
    nama: str = Field(max_length=60)
    kode: str = Field(index=True, unique=True, max_length=6)
    pengaturan_json: str = Field(default=json.dumps(PENGATURAN_KELAS_BAWAAN))
    dibuat: datetime = Field(default_factory=sekarang)

    @property
    def pengaturan(self) -> dict:
        return {**PENGATURAN_KELAS_BAWAAN, **json.loads(self.pengaturan_json or "{}")}


class Siswa(SQLModel, table=True):
    __table_args__ = (UniqueConstraint("kelas_id", "nama_kunci"),)

    id: int | None = Field(default=None, primary_key=True)
    kelas_id: int = Field(foreign_key="kelas.id", index=True)
    nama_panggilan: str = Field(max_length=20)
    nama_kunci: str = Field(max_length=20)  # huruf kecil, untuk keunikan per kelas
    hash_pin: str
    kode_pseudonim: str = Field(index=True, unique=True, max_length=12)
    dibuat: datetime = Field(default_factory=sekarang)


class Percobaan(SQLModel, table=True):
    # id dibuat di perangkat (UUID) → pengiriman ulang tidak tercatat ganda
    id: str = Field(primary_key=True, max_length=64)
    siswa_id: int = Field(foreign_key="siswa.id", index=True)
    modul: str | None = Field(default=None, max_length=10)
    soal: str | None = Field(default=None, max_length=300)
    level: int | None = None
    fase: str | None = Field(default=None, max_length=30)
    benar: bool
    kode_kesalahan: str | None = Field(default=None, max_length=8)
    pakai_petunjuk: bool = False
    waktu_klien: str = Field(max_length=40)
    waktu_server: datetime = Field(default_factory=sekarang)


class SkalaBeban(SQLModel, table=True):
    id: str = Field(primary_key=True, max_length=64)
    siswa_id: int = Field(foreign_key="siswa.id", index=True)
    aktivitas: str = Field(max_length=30)
    jenis: str = Field(max_length=10)  # 'paas' | 'leppink'
    item: str = Field(max_length=10)  # 'usaha' | IL1..GL4
    skor: int
    waktu_klien: str = Field(max_length=40)
    waktu_server: datetime = Field(default_factory=sekarang)
