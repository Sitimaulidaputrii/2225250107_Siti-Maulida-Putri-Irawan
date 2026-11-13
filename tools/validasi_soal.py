"""Memvalidasi bank soal PtLSV dengan SymPy.

Untuk setiap soal diperiksa:
1. Struktur file sesuai tools/skema_soal.json.
2. Kunci jawaban menghasilkan himpunan penyelesaian yang SAMA dengan soal.
3. Setiap jawaban di `salah_umum` memang BERBEDA dari kunci.
4. Setiap `langkah[].ekspresi` ekuivalen dengan soal (tidak ada langkah yang keliru).

Pemakaian (dari akar proyek):
    python tools/validasi_soal.py frontend/public/konten/soal-*.json
Kode keluar 0 bila semua lolos, 1 bila ada kesalahan.
"""
import glob
import json
import sys
from pathlib import Path

from jsonschema import Draft202012Validator
from sympy import Ge, Gt, Le, Lt, solve_univariate_inequality, symbols
from sympy.parsing.sympy_parser import (
    implicit_multiplication_application,
    parse_expr,
    standard_transformations,
)

x = symbols("x", real=True)
TRANSFORMASI = standard_transformations + (implicit_multiplication_application,)
RELASI = {"<=": Le, ">=": Ge, "<": Lt, ">": Gt}  # urutan penting: <= sebelum <
SKEMA = json.loads((Path(__file__).parent / "skema_soal.json").read_text(encoding="utf-8"))


def normalisasi(teks: str) -> str:
    return teks.replace("−", "-").replace("≤", "<=").replace("≥", ">=").replace("·", "*")


def ke_relasi(teks: str):
    """'-3x + 5 <= 11', '2(x-3) < 5x+9', 'x/2 + 1 ≥ 4' -> relasi SymPy."""
    teks = normalisasi(teks)
    for op, Rel in RELASI.items():
        if op in teks:
            kiri, kanan = teks.split(op, 1)
            baca = lambda s: parse_expr(s, local_dict={"x": x}, transformations=TRANSFORMASI)
            return Rel(baca(kiri), baca(kanan))
    raise ValueError(f"tanda pertidaksamaan tidak ditemukan: {teks!r}")


def himpunan(teks: str):
    return solve_univariate_inequality(ke_relasi(teks), x, relational=False)


def dari_jawaban(j: dict) -> str:
    return f"x {j['tanda']} {j['nilai']}"


def periksa_soal(soal: dict) -> list[str]:
    galat = []
    sid = soal.get("id", "?")
    model = soal.get("model") or soal["soal"]  # soal cerita memakai `model`
    try:
        hp = himpunan(model)
    except Exception as e:  # noqa: BLE001 — laporkan semua galat parsing
        return [f"{sid}: soal tidak terbaca ({e})"]

    if himpunan(dari_jawaban(soal["jawaban"])) != hp:
        galat.append(f"{sid}: kunci '{dari_jawaban(soal['jawaban'])}' salah; seharusnya {hp}")

    for s in soal.get("salah_umum", []):
        if himpunan(dari_jawaban(s["jawaban"])) == hp:
            galat.append(f"{sid}: salah_umum {s['kode']} sama dengan kunci")

    for i, langkah in enumerate(soal.get("langkah", []), start=1):
        if himpunan(langkah["ekspresi"]) != hp:
            galat.append(f"{sid}: langkah {i} '{langkah['ekspresi']}' tidak ekuivalen dengan soal")
    return galat


def periksa_file(path: Path) -> list[str]:
    data = json.loads(path.read_text(encoding="utf-8"))
    galat = [
        f"{path.name}: skema — {'/'.join(map(str, e.path))}: {e.message}"
        for e in Draft202012Validator(SKEMA).iter_errors(data)
    ]
    if galat:
        return galat
    ids = [s["id"] for s in data]
    galat += [f"{path.name}: id ganda {i}" for i in sorted({i for i in ids if ids.count(i) > 1})]
    for soal in data:
        galat += [f"{path.name}: {g}" for g in periksa_soal(soal)]
    return galat


def main(argumen: list[str]) -> int:
    berkas = sorted({Path(p) for pola in argumen for p in glob.glob(pola)})
    if not berkas:
        print("Tidak ada file soal yang cocok.")
        return 1
    semua_galat, jumlah = [], 0
    for path in berkas:
        jumlah += len(json.loads(path.read_text(encoding="utf-8")))
        semua_galat += periksa_file(path)
    for g in semua_galat:
        print("[SALAH]", g)
    print(f"{jumlah} soal dari {len(berkas)} file diperiksa, {len(semua_galat)} kesalahan.")
    return 1 if semua_galat else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:] or ["frontend/public/konten/soal-*.json"]))
