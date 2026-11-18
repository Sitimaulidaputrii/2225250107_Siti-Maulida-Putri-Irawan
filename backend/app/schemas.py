"""Bentuk data permintaan & jawaban API (validasi otomatis oleh Pydantic)."""
from pydantic import BaseModel, Field

POLA_EMAIL = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"


class GuruDaftar(BaseModel):
    nama: str = Field(min_length=2, max_length=80)
    email: str = Field(pattern=POLA_EMAIL, max_length=254)
    sandi: str = Field(min_length=8, max_length=128)


class GuruMasuk(BaseModel):
    email: str = Field(max_length=254)
    sandi: str = Field(max_length=128)


class SiswaMasuk(BaseModel):
    kode_kelas: str = Field(pattern=r"^[A-Za-z0-9]{6}$")
    nama_panggilan: str = Field(min_length=2, max_length=20)
    pin: str = Field(pattern=r"^\d{4}$")


class KelasBaru(BaseModel):
    nama: str = Field(min_length=1, max_length=60)


class PengaturanKelas(BaseModel):
    promptPenjelasan: bool = True
    skalaBeban: bool = False


class PercobaanMasuk(BaseModel):
    id: str = Field(min_length=8, max_length=64)
    waktu_klien: str = Field(max_length=40)
    modul: str | None = Field(default=None, max_length=10)
    soal: str | None = Field(default=None, max_length=300)
    level: int | None = Field(default=None, ge=0, le=10)
    fase: str | None = Field(default=None, max_length=30)
    benar: bool
    kode_kesalahan: str | None = Field(default=None, max_length=8)
    pakai_petunjuk: bool = False


class SkalaMasuk(BaseModel):
    id: str = Field(min_length=8, max_length=64)
    waktu_klien: str = Field(max_length=40)
    aktivitas: str = Field(max_length=30)
    jenis: str = Field(pattern=r"^(paas|leppink)$")
    item: str = Field(pattern=r"^(usaha|IL[1-3]|EL[1-3]|GL[1-4])$")
    skor: int = Field(ge=0, le=10)
