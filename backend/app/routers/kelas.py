"""Kelas: dibuat guru; siswa membaca kelas & pengaturannya sendiri."""
import json
import secrets

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlmodel import Session, select

from ..db import get_session
from ..models import Guru, Kelas, Siswa
from ..schemas import KelasBaru, PengaturanKelas
from ..security import guru_saat_ini, siswa_saat_ini
from .auth import info_kelas

router = APIRouter(prefix="/api/kelas", tags=["kelas"])

# Tanpa huruf/angka yang mirip (0/O, 1/I) agar mudah didikte di kelas
HURUF_KODE = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"


def buat_kode(sesi: Session) -> str:
    for _ in range(20):
        kode = "".join(secrets.choice(HURUF_KODE) for _ in range(6))
        if not sesi.exec(select(Kelas).where(Kelas.kode == kode)).first():
            return kode
    raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "Gagal membuat kode kelas, coba lagi.")


def kelas_milik(sesi: Session, id_: int, guru: Guru) -> Kelas:
    kelas = sesi.get(Kelas, id_)
    if kelas is None or kelas.guru_id != guru.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Kelas tidak ditemukan.")
    return kelas


@router.get("/saya")
def kelas_saya(siswa: Siswa = Depends(siswa_saat_ini), sesi: Session = Depends(get_session)) -> dict:
    return info_kelas(sesi.get(Kelas, siswa.kelas_id))


@router.post("", status_code=201)
def buat_kelas(data: KelasBaru, guru: Guru = Depends(guru_saat_ini), sesi: Session = Depends(get_session)) -> dict:
    kelas = Kelas(guru_id=guru.id, nama=data.nama.strip(), kode=buat_kode(sesi))
    sesi.add(kelas)
    sesi.commit()
    sesi.refresh(kelas)
    return {**info_kelas(kelas), "jumlah_siswa": 0}


@router.get("")
def daftar_kelas(guru: Guru = Depends(guru_saat_ini), sesi: Session = Depends(get_session)) -> list[dict]:
    hasil = sesi.exec(
        select(Kelas, func.count(Siswa.id))
        .join(Siswa, Siswa.kelas_id == Kelas.id, isouter=True)
        .where(Kelas.guru_id == guru.id)
        .group_by(Kelas.id)
        .order_by(Kelas.dibuat.desc())
    ).all()
    return [{**info_kelas(k), "jumlah_siswa": n} for k, n in hasil]


@router.patch("/{id_}/pengaturan")
def ubah_pengaturan(
    id_: int, data: PengaturanKelas, guru: Guru = Depends(guru_saat_ini), sesi: Session = Depends(get_session)
) -> dict:
    kelas = kelas_milik(sesi, id_, guru)
    kelas.pengaturan_json = json.dumps(data.model_dump())
    sesi.add(kelas)
    sesi.commit()
    return info_kelas(kelas)
