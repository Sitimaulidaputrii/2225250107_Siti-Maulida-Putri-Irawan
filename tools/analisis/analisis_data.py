"""Analisis data uji coba TandaTepat (dokumen 09) — hanya memakai pustaka bawaan Python.

Perintah:
  python tools/analisis/analisis_data.py validasi  FILE.csv [--kategori 4] [--terendah 1]
  python tools/analisis/analisis_data.py sus       FILE.csv
  python tools/analisis/analisis_data.py tes       FILE.csv --maks 100
  python tools/analisis/analisis_data.py reliabel  FILE.csv           (alfa Cronbach, kolom = butir)
  python tools/analisis/analisis_data.py beban     EKSPOR_SKALA.csv [--tes TES.csv --maks 100]
  python tools/analisis/analisis_data.py kesalahan EKSPOR_JAWABAN.csv

Format CSV ada di docs/instrumen/08-panduan-analisis-data.md dan contohnya di tools/analisis/contoh/.
"""
import argparse
import csv
import math
import sys
from collections import Counter, defaultdict
from pathlib import Path
from statistics import mean, pstdev, stdev, variance

# =============================================================== statistik dasar


def _betacf(a: float, b: float, x: float) -> float:
    """Pecahan berlanjut untuk fungsi beta tak lengkap (metode Lentz)."""
    kecil = 1e-300
    qab, qap, qam = a + b, a + 1, a - 1
    c, d = 1.0, 1 - qab * x / qap
    d = 1 / (d if abs(d) > kecil else kecil)
    h = d
    for m in range(1, 300):
        m2 = 2 * m
        aa = m * (b - m) * x / ((qam + m2) * (a + m2))
        d = 1 + aa * d
        d = 1 / (d if abs(d) > kecil else kecil)
        c = 1 + aa / c if abs(1 + aa / c) > kecil else kecil
        h *= d * c
        aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2))
        d = 1 + aa * d
        d = 1 / (d if abs(d) > kecil else kecil)
        c = 1 + aa / c if abs(1 + aa / c) > kecil else kecil
        delta = d * c
        h *= delta
        if abs(delta - 1) < 1e-12:
            break
    return h


def beta_tak_lengkap(a: float, b: float, x: float) -> float:
    """Fungsi beta tak lengkap teregularisasi I_x(a, b)."""
    if x <= 0:
        return 0.0
    if x >= 1:
        return 1.0
    ln_bt = math.lgamma(a + b) - math.lgamma(a) - math.lgamma(b) + a * math.log(x) + b * math.log(1 - x)
    if x < (a + 1) / (a + b + 2):
        return math.exp(ln_bt) * _betacf(a, b, x) / a
    return 1 - math.exp(ln_bt) * _betacf(b, a, 1 - x) / b


def p_dua_sisi_t(t: float, df: int) -> float:
    """Nilai p dua sisi untuk statistik t dengan derajat bebas df."""
    return beta_tak_lengkap(df / 2, 0.5, df / (df + t * t))


# =============================================================== ukuran

def aiken_v(skor: list[float], terendah: int = 1, kategori: int = 4) -> float:
    """Aiken's V = Σ(r − lo) / [n(c − 1)]."""
    return sum(r - terendah for r in skor) / (len(skor) * (kategori - 1))


def skor_sus(jawaban: list[int]) -> float:
    """System Usability Scale: butir ganjil (r − 1), genap (5 − r), jumlah × 2,5."""
    if len(jawaban) != 10:
        raise ValueError("SUS memerlukan 10 butir")
    return 2.5 * sum((r - 1) if i % 2 == 0 else (5 - r) for i, r in enumerate(jawaban))


def kategori_sus(s: float) -> str:
    # Mengacu pada Bangor dkk. (2009); 68 = rata-rata
    if s >= 85:
        return "sangat baik"
    if s >= 72:
        return "baik"
    if s >= 68:
        return "di atas rata-rata"
    if s >= 51:
        return "cukup"
    return "kurang"


def n_gain(pre: float, post: float, maks: float) -> float | None:
    """N-gain Hake: (post − pre) / (maks − pre)."""
    return None if pre >= maks else (post - pre) / (maks - pre)


def kategori_gain(g: float) -> str:
    return "tinggi" if g >= 0.7 else "sedang" if g >= 0.3 else "rendah"


def uji_t_berpasangan(a: list[float], b: list[float]) -> dict:
    selisih = [y - x for x, y in zip(a, b, strict=True)]
    n = len(selisih)
    if n < 2:
        raise ValueError("Uji-t memerlukan minimal 2 pasang data")
    sd = stdev(selisih)
    rata = mean(selisih)
    if sd == 0:
        return {"n": n, "rata_selisih": rata, "t": math.inf, "df": n - 1, "p": 0.0, "d_cohen": math.inf}
    t = rata / (sd / math.sqrt(n))
    return {"n": n, "rata_selisih": rata, "t": t, "df": n - 1, "p": p_dua_sisi_t(t, n - 1), "d_cohen": rata / sd}


def alfa_cronbach(baris: list[list[float]]) -> float:
    """baris = responden, kolom = butir."""
    k = len(baris[0])
    var_butir = [variance([r[i] for r in baris]) for i in range(k)]
    var_total = variance([sum(r) for r in baris])
    return k / (k - 1) * (1 - sum(var_butir) / var_total)


def skor_z(nilai: list[float]) -> list[float]:
    m, s = mean(nilai), pstdev(nilai)
    return [0.0 if s == 0 else (v - m) / s for v in nilai]


def efisiensi(kinerja: list[float], usaha: list[float]) -> list[float]:
    """Efisiensi instruksional Paas & van Merriënboer (1993): E = (z_kinerja − z_usaha) / √2."""
    return [(zk - zu) / math.sqrt(2) for zk, zu in zip(skor_z(kinerja), skor_z(usaha), strict=True)]


# =============================================================== baca CSV

def baca(path: str) -> list[dict]:
    with open(path, encoding="utf-8-sig", newline="") as f:
        contoh = f.read(2048)
        f.seek(0)
        dialek = csv.Sniffer().sniff(contoh, delimiters=",;\t")
        return list(csv.DictReader(f, dialect=dialek))


def angka(s: str) -> float:
    return float(str(s).replace(",", "."))


# =============================================================== perintah

def cmd_validasi(arg) -> None:
    data = baca(arg.file)
    kolom = [k for k in data[0] if k.lower() != "butir"]
    print(f"Aiken's V — {len(data)} butir, {len(kolom)} validator, skala {arg.terendah}–{arg.terendah + arg.kategori - 1}\n")
    semua = []
    for b in data:
        skor = [angka(b[k]) for k in kolom]
        v = aiken_v(skor, arg.terendah, arg.kategori)
        semua.extend(skor)
        print(f"  {b.get('butir', '?'):<30} V = {v:.3f}   rata-rata = {mean(skor):.2f}")
    print(f"\n  Rata-rata seluruh skor: {mean(semua):.2f}   V keseluruhan: {aiken_v(semua, arg.terendah, arg.kategori):.3f}")
    print("  Bandingkan V tiap butir dengan nilai kritis tabel Aiken untuk n validator & kategori yang dipakai.")


def cmd_sus(arg) -> None:
    data = baca(arg.file)
    skor = []
    for r in data:
        s = skor_sus([int(angka(r[f"q{i}"])) for i in range(1, 11)])
        skor.append(s)
        print(f"  {r.get('siswa', '?'):<12} {s:6.1f}")
    rata = mean(skor)
    print(f"\nSUS rata-rata = {rata:.1f} ({kategori_sus(rata)}), n = {len(skor)}")


def cmd_tes(arg) -> None:
    data = baca(arg.file)
    pre = [angka(r["pretest"]) for r in data]
    post = [angka(r["posttest"]) for r in data]
    gain = [n_gain(a, b, arg.maks) for a, b in zip(pre, post, strict=True)]
    for r, g in zip(data, gain, strict=True):
        teks = "–" if g is None else f"{g:.2f} ({kategori_gain(g)})"
        print(f"  {r.get('siswa', '?'):<12} pre {angka(r['pretest']):6.1f}  post {angka(r['posttest']):6.1f}  g = {teks}")
    g_rata = mean([g for g in gain if g is not None])
    g_kelas = n_gain(mean(pre), mean(post), arg.maks)
    print(f"\nRata-rata pretest {mean(pre):.2f}, posttest {mean(post):.2f} (n = {len(pre)})")
    print(f"Rata-rata N-gain individu = {g_rata:.3f} ({kategori_gain(g_rata)})")
    print(f"N-gain kelas <g> (Hake)    = {g_kelas:.3f} ({kategori_gain(g_kelas)})")
    t = uji_t_berpasangan(pre, post)
    print(f"Uji-t berpasangan: t({t['df']}) = {t['t']:.3f}, p = {t['p']:.4f}, d Cohen = {t['d_cohen']:.2f}")
    print("Catatan: periksa normalitas selisih; jika tidak normal gunakan uji Wilcoxon (mis. di JASP/SPSS).")


def cmd_reliabel(arg) -> None:
    data = baca(arg.file)
    kolom = [k for k in data[0] if k.lower() not in ("siswa", "responden", "nama")]
    baris = [[angka(r[k]) for k in kolom] for r in data]
    print(f"Alfa Cronbach = {alfa_cronbach(baris):.3f} ({len(kolom)} butir, {len(baris)} responden)")


def ringkas_beban(data: list[dict]) -> dict:
    per_siswa: dict[str, dict] = defaultdict(lambda: {"paas": [], "IL": [], "EL": [], "GL": []})
    for r in data:
        s = per_siswa[r["kode_siswa"]]
        if r["jenis"] == "paas":
            s["paas"].append(angka(r["skor"]))
        else:
            s[r["item"][:2]].append(angka(r["skor"]))
    return per_siswa


def cmd_beban(arg) -> None:
    per_siswa = ringkas_beban(baca(arg.file))
    print(f"{'Siswa':<12}{'Paas':>8}{'IL':>8}{'EL':>8}{'GL':>8}")
    rata = lambda v: mean(v) if v else float("nan")  # noqa: E731
    for k, s in sorted(per_siswa.items()):
        print(f"{k:<12}{rata(s['paas']):8.2f}{rata(s['IL']):8.2f}{rata(s['EL']):8.2f}{rata(s['GL']):8.2f}")
    for j in ("paas", "IL", "EL", "GL"):
        nilai = [x for s in per_siswa.values() for x in s[j]]
        if nilai:
            print(f"  {j:<5} rata-rata {mean(nilai):.2f}  (n = {len(nilai)} isian)")
    if arg.tes:
        tes = {r["siswa"]: angka(r["posttest"]) / arg.maks * 100 for r in baca(arg.tes)}
        pasangan = [(k, tes[k], mean(s["paas"])) for k, s in per_siswa.items() if k in tes and s["paas"]]
        if len(pasangan) >= 2:
            e = efisiensi([p[1] for p in pasangan], [p[2] for p in pasangan])
            print("\nEfisiensi instruksional (posttest vs usaha mental Paas):")
            for (k, _, _), ei in zip(pasangan, e, strict=True):
                print(f"  {k:<12} E = {ei:+.2f}")
            print(f"  Rata-rata E = {mean(e):+.2f}  (positif = kinerja tinggi dengan usaha relatif rendah)")


def cmd_kesalahan(arg) -> None:
    data = baca(arg.file)
    salah = [r for r in data if r["benar"] in ("0", "False", "false")]
    print(f"{len(data)} jawaban, {len(data) - len(salah)} benar ({(len(data) - len(salah)) / len(data):.0%})\n")
    print("Frekuensi jenis kesalahan:")
    for kode, n in Counter(r["kode_kesalahan"] or "–" for r in salah).most_common():
        print(f"  {kode:<6}{n}")
    print("\nAkurasi per modul:")
    per_modul = defaultdict(list)
    for r in data:
        per_modul[r["modul"] or "–"].append(r["benar"] in ("1", "True", "true"))
    for m, v in sorted(per_modul.items()):
        print(f"  {m:<6}{mean(v):.0%}  (n = {len(v)})")


def main(argv: list[str] | None = None) -> None:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="perintah", required=True)
    s = sub.add_parser("validasi"); s.add_argument("file"); s.add_argument("--kategori", type=int, default=4); s.add_argument("--terendah", type=int, default=1)  # noqa: E702
    s = sub.add_parser("sus"); s.add_argument("file")  # noqa: E702
    s = sub.add_parser("tes"); s.add_argument("file"); s.add_argument("--maks", type=float, default=100)  # noqa: E702
    s = sub.add_parser("reliabel"); s.add_argument("file")  # noqa: E702
    s = sub.add_parser("beban"); s.add_argument("file"); s.add_argument("--tes"); s.add_argument("--maks", type=float, default=100)  # noqa: E702
    s = sub.add_parser("kesalahan"); s.add_argument("file")  # noqa: E702
    arg = p.parse_args(argv)
    if not Path(arg.file).exists():
        sys.exit(f"File tidak ditemukan: {arg.file}")
    {"validasi": cmd_validasi, "sus": cmd_sus, "tes": cmd_tes, "reliabel": cmd_reliabel,
     "beban": cmd_beban, "kesalahan": cmd_kesalahan}[arg.perintah](arg)


if __name__ == "__main__":
    main()
