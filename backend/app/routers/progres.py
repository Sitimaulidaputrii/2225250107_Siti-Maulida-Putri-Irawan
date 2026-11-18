"""Sinkron data belajar dari perangkat siswa (idempoten: id dibuat di perangkat)."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from ..db import get_session
from ..models import Percobaan, Siswa, SkalaBeban
from ..schemas import PercobaanMasuk, SkalaMasuk
from ..security import siswa_saat_ini

router = APIRouter(prefix="/api/progres", tags=["progres"])

BATAS_KIRIMAN = 500


def _cek_ukuran(data: list) -> None:
    if len(data) > BATAS_KIRIMAN:
        raise HTTPException(status.HTTP_413_CONTENT_TOO_LARGE, f"Maksimal {BATAS_KIRIMAN} data per kiriman.")


def _id_yang_ada(sesi: Session, model, ids: list[str]) -> set[str]:
    return set(sesi.exec(select(model.id).where(model.id.in_(ids))).all()) if ids else set()


@router.post("/percobaan")
def kirim_percobaan(
    data: list[PercobaanMasuk], siswa: Siswa = Depends(siswa_saat_ini), sesi: Session = Depends(get_session)
) -> dict:
    _cek_ukuran(data)
    ada = _id_yang_ada(sesi, Percobaan, [p.id for p in data])
    baru = {p.id: p for p in data if p.id not in ada}  # dict: id ganda dalam satu kiriman diabaikan
    for p in baru.values():
        sesi.add(Percobaan(**p.model_dump(), siswa_id=siswa.id))
    sesi.commit()
    return {"diterima": len(baru), "sudah_ada": len(data) - len(baru)}


@router.post("/skala-beban")
def kirim_skala(
    data: list[SkalaMasuk], siswa: Siswa = Depends(siswa_saat_ini), sesi: Session = Depends(get_session)
) -> dict:
    _cek_ukuran(data)
    for s in data:
        if s.jenis == "paas" and not 1 <= s.skor <= 9:
            raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Skor Paas harus 1–9.")
    ada = _id_yang_ada(sesi, SkalaBeban, [s.id for s in data])
    baru = {s.id: s for s in data if s.id not in ada}
    for s in baru.values():
        sesi.add(SkalaBeban(**s.model_dump(), siswa_id=siswa.id))
    sesi.commit()
    return {"diterima": len(baru)}


@router.get("/saya")
def progres_saya(siswa: Siswa = Depends(siswa_saat_ini), sesi: Session = Depends(get_session)) -> dict:
    semua = sesi.exec(select(Percobaan).where(Percobaan.siswa_id == siswa.id)).all()
    return {"jumlah": len(semua), "benar": sum(p.benar for p in semua)}
