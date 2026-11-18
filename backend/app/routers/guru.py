"""Dasbor guru: ringkasan kelas dan ekspor data anonim (CSV)."""
import csv
import io
from collections import Counter
from statistics import mean
from typing import Literal

from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlmodel import Session, select

from ..db import get_session
from ..models import Guru, Percobaan, Siswa, SkalaBeban
from ..security import guru_saat_ini
from .auth import info_kelas
from .kelas import kelas_milik

router = APIRouter(prefix="/api/guru", tags=["guru"])


def ringkas_siswa(percobaan: list[Percobaan]) -> dict:
    jumlah = len(percobaan)
    benar = sum(p.benar for p in percobaan)
    kesalahan = Counter(p.kode_kesalahan for p in percobaan if not p.benar and p.kode_kesalahan not in (None, "LAIN"))
    level = [p.level for p in percobaan if p.benar and p.level]
    return {
        "jumlah": jumlah,
        "benar": benar,
        "akurasi": benar / jumlah if jumlah else 0.0,
        "petunjuk": sum(p.pakai_petunjuk for p in percobaan),
        "level_tertinggi": max(level) if level else None,
        "kesalahan_utama": kesalahan.most_common(1)[0][0] if kesalahan else None,
    }


def ringkas_skala(skala: list[SkalaBeban]) -> dict:
    paas = [s.skor for s in skala if s.jenis == "paas"]
    leppink = [s for s in skala if s.jenis == "leppink"]
    hasil = {
        "jumlah_paas": len(paas),
        "paas_rata": mean(paas) if paas else None,
        "jumlah_leppink": len(leppink),
        "leppink": None,
    }
    if leppink:
        per_jenis = {j: [s.skor for s in leppink if s.item.startswith(j)] for j in ("IL", "EL", "GL")}
        hasil["leppink"] = {j: mean(v) if v else 0.0 for j, v in per_jenis.items()}
    return hasil


@router.get("/kelas/{id_}/ringkasan")
def ringkasan_kelas(id_: int, guru: Guru = Depends(guru_saat_ini), sesi: Session = Depends(get_session)) -> dict:
    kelas = kelas_milik(sesi, id_, guru)
    siswa = sesi.exec(select(Siswa).where(Siswa.kelas_id == kelas.id).order_by(Siswa.nama_kunci)).all()
    ids = [s.id for s in siswa]
    percobaan = sesi.exec(select(Percobaan).where(Percobaan.siswa_id.in_(ids))).all() if ids else []
    skala = sesi.exec(select(SkalaBeban).where(SkalaBeban.siswa_id.in_(ids))).all() if ids else []

    per_siswa: dict[int, list[Percobaan]] = {i: [] for i in ids}
    for p in percobaan:
        per_siswa[p.siswa_id].append(p)

    distribusi = Counter(p.kode_kesalahan for p in percobaan if not p.benar and p.kode_kesalahan not in (None, "LAIN"))
    return {
        "kelas": info_kelas(kelas),
        "siswa": [
            {"id": s.id, "nama_panggilan": s.nama_panggilan, "kode_pseudonim": s.kode_pseudonim, **ringkas_siswa(per_siswa[s.id])}
            for s in siswa
        ],
        "distribusi": dict(distribusi),
        "skala": ringkas_skala(skala),
    }


KOLOM_PERCOBAAN = ["kode_siswa", "modul", "soal", "level", "fase", "benar", "kode_kesalahan", "pakai_petunjuk", "waktu"]
KOLOM_SKALA = ["kode_siswa", "aktivitas", "jenis", "item", "skor", "waktu"]


def ke_csv(kolom: list[str], baris: list[list]) -> str:
    buf = io.StringIO()
    tulis = csv.writer(buf)
    tulis.writerow(kolom)
    tulis.writerows(baris)
    return "﻿" + buf.getvalue()  # BOM agar terbaca benar di Microsoft Excel


@router.get("/kelas/{id_}/ekspor.csv")
def ekspor(
    id_: int,
    jenis: Literal["percobaan", "skala"] = "percobaan",
    guru: Guru = Depends(guru_saat_ini),
    sesi: Session = Depends(get_session),
) -> Response:
    kelas = kelas_milik(sesi, id_, guru)
    siswa = {s.id: s.kode_pseudonim for s in sesi.exec(select(Siswa).where(Siswa.kelas_id == kelas.id)).all()}
    ids = list(siswa)
    if jenis == "percobaan":
        data = sesi.exec(select(Percobaan).where(Percobaan.siswa_id.in_(ids)).order_by(Percobaan.waktu_klien)).all() if ids else []
        isi = ke_csv(KOLOM_PERCOBAAN, [
            [siswa[p.siswa_id], p.modul, p.soal, p.level, p.fase, int(p.benar), p.kode_kesalahan, int(p.pakai_petunjuk), p.waktu_klien]
            for p in data
        ])
    else:
        data = sesi.exec(select(SkalaBeban).where(SkalaBeban.siswa_id.in_(ids)).order_by(SkalaBeban.waktu_klien)).all() if ids else []
        isi = ke_csv(KOLOM_SKALA, [[siswa[s.siswa_id], s.aktivitas, s.jenis, s.item, s.skor, s.waktu_klien] for s in data])
    nama = f"{kelas.kode}-{jenis}.csv"
    return Response(isi, media_type="text/csv; charset=utf-8", headers={"Content-Disposition": f'attachment; filename="{nama}"'})
