"""Autentikasi: guru (email + sandi) dan siswa (kode kelas + nama panggilan + PIN)."""
import secrets

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from ..db import get_session
from ..models import Guru, Kelas, Siswa
from ..schemas import GuruDaftar, GuruMasuk, SiswaMasuk
from ..security import buat_hash, buat_token, catat_gagal, cocokkan_hash, periksa_batas

router = APIRouter(prefix="/api/auth", tags=["autentikasi"])

HURUF_PSEUDONIM = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"


def info_kelas(k: Kelas) -> dict:
    return {"id": k.id, "nama": k.nama, "kode": k.kode, "pengaturan": k.pengaturan}


def jawaban_guru(g: Guru) -> dict:
    return {"token": buat_token("guru", g.id), "guru": {"id": g.id, "nama": g.nama, "email": g.email}}


def jawaban_siswa(s: Siswa, k: Kelas) -> dict:
    return {
        "token": buat_token("siswa", s.id),
        "siswa": {"id": s.id, "nama_panggilan": s.nama_panggilan},
        "kelas": info_kelas(k),
    }


@router.post("/guru/daftar", status_code=201)
def daftar_guru(data: GuruDaftar, sesi: Session = Depends(get_session)) -> dict:
    email = data.email.strip().lower()
    if sesi.exec(select(Guru).where(Guru.email == email)).first():
        raise HTTPException(status.HTTP_409_CONFLICT, "Email ini sudah terdaftar. Silakan masuk.")
    guru = Guru(email=email, nama=data.nama.strip(), hash_sandi=buat_hash(data.sandi))
    sesi.add(guru)
    sesi.commit()
    sesi.refresh(guru)
    return jawaban_guru(guru)


@router.post("/guru/masuk")
def masuk_guru(data: GuruMasuk, sesi: Session = Depends(get_session)) -> dict:
    email = data.email.strip().lower()
    kunci = f"guru:{email}"
    periksa_batas(kunci)
    guru = sesi.exec(select(Guru).where(Guru.email == email)).first()
    if guru is None or not cocokkan_hash(data.sandi, guru.hash_sandi):
        catat_gagal(kunci)
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Email atau kata sandi salah.")
    return jawaban_guru(guru)


def _cari_kelas(sesi: Session, kode: str) -> Kelas:
    kelas = sesi.exec(select(Kelas).where(Kelas.kode == kode.upper())).first()
    if kelas is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Kode kelas tidak ditemukan. Periksa lagi kodenya.")
    return kelas


@router.post("/siswa/gabung", status_code=201)
def gabung_siswa(data: SiswaMasuk, sesi: Session = Depends(get_session)) -> dict:
    kelas = _cari_kelas(sesi, data.kode_kelas)
    nama = data.nama_panggilan.strip()
    siswa = Siswa(
        kelas_id=kelas.id,
        nama_panggilan=nama,
        nama_kunci=nama.lower(),
        hash_pin=buat_hash(data.pin),
        kode_pseudonim="S" + "".join(secrets.choice(HURUF_PSEUDONIM) for _ in range(7)),
    )
    sesi.add(siswa)
    try:
        sesi.commit()
    except IntegrityError:
        sesi.rollback()
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            'Nama ini sudah dipakai di kelas ini. Jika itu kamu, pilih "Sudah pernah gabung"; jika bukan, pakai nama lain.',
        ) from None
    sesi.refresh(siswa)
    return jawaban_siswa(siswa, kelas)


@router.post("/siswa/masuk")
def masuk_siswa(data: SiswaMasuk, sesi: Session = Depends(get_session)) -> dict:
    kelas = _cari_kelas(sesi, data.kode_kelas)
    nama = data.nama_panggilan.strip().lower()
    kunci = f"siswa:{kelas.id}:{nama}"
    periksa_batas(kunci)
    siswa = sesi.exec(select(Siswa).where(Siswa.kelas_id == kelas.id, Siswa.nama_kunci == nama)).first()
    if siswa is None or not cocokkan_hash(data.pin, siswa.hash_pin):
        catat_gagal(kunci)
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Nama panggilan atau PIN salah.")
    return jawaban_siswa(siswa, kelas)
