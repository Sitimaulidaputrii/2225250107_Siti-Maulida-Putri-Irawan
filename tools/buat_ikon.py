"""Membuat ikon PWA (PNG) tanpa pustaka tambahan.

Desain: latar biru, simbol "≥" putih dengan panah balik oranye kecil —
melambangkan aturan pembalikan tanda (fokus utama aplikasi).

Jalankan dari akar proyek:
    python tools/buat_ikon.py
"""
import math
import struct
import zlib
from pathlib import Path

BIRU = (29, 78, 216)
PUTIH = (255, 255, 255)
ORANYE = (234, 88, 12)
TUJUAN = Path(__file__).resolve().parent.parent / "frontend" / "public" / "icons"


def jarak_ke_ruas(px, py, ax, ay, bx, by):
    dx, dy = bx - ax, by - ay
    t = max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
    return math.hypot(px - (ax + t * dx), py - (ay + t * dy))


def gambar(n: int, skala_isi: float, sudut_bulat: bool) -> bytes:
    """Mengembalikan baris piksel RGBA. skala_isi < 1 menyusutkan simbol (untuk ikon maskable)."""
    c = n / 2
    s = n * skala_isi
    # Simbol ">" (dua ruas) + garis bawah: membentuk "≥"
    ruas_putih = [
        (c - 0.22 * s, c - 0.30 * s, c + 0.20 * s, c - 0.08 * s),
        (c + 0.20 * s, c - 0.08 * s, c - 0.22 * s, c + 0.14 * s),
        (c - 0.22 * s, c + 0.30 * s, c + 0.20 * s, c + 0.30 * s),
    ]
    tebal = 0.055 * s
    # Panah balik kecil oranye (busur) di pojok kanan atas
    pusat_busur = (c + 0.27 * s, c - 0.27 * s)
    r_busur, tebal_busur = 0.09 * s, 0.03 * s
    r_sudut = 0.18 * n

    baris = bytearray()
    for y in range(n):
        baris.append(0)  # filter PNG: none
        for x in range(n):
            px, py = x + 0.5, y + 0.5
            # Sudut membulat (hanya ikon biasa; maskable harus penuh)
            alfa = 255
            if sudut_bulat:
                qx = max(r_sudut - px, px - (n - r_sudut), 0)
                qy = max(r_sudut - py, py - (n - r_sudut), 0)
                d = math.hypot(qx, qy) - r_sudut
                alfa = int(255 * max(0.0, min(1.0, 0.5 - d)))
            warna = BIRU
            d_simbol = min(jarak_ke_ruas(px, py, *r) for r in ruas_putih)
            liputan = max(0.0, min(1.0, tebal - d_simbol + 0.5))
            if liputan > 0:
                warna = tuple(round(b * (1 - liputan) + p * liputan) for b, p in zip(warna, PUTIH))
            d_busur = abs(math.hypot(px - pusat_busur[0], py - pusat_busur[1]) - r_busur)
            sudut = math.atan2(py - pusat_busur[1], px - pusat_busur[0])
            if -math.pi * 0.9 < sudut < math.pi * 0.5:
                liputan = max(0.0, min(1.0, tebal_busur - d_busur + 0.5))
                if liputan > 0:
                    warna = tuple(round(b * (1 - liputan) + o * liputan) for b, o in zip(warna, ORANYE))
            baris.extend((*warna, alfa))
    return bytes(baris)


def tulis_png(path: Path, n: int, data: bytes) -> None:
    def potongan(tipe: bytes, isi: bytes) -> bytes:
        return struct.pack(">I", len(isi)) + tipe + isi + struct.pack(">I", zlib.crc32(tipe + isi))

    png = b"\x89PNG\r\n\x1a\n"
    png += potongan(b"IHDR", struct.pack(">IIBBBBB", n, n, 8, 6, 0, 0, 0))
    png += potongan(b"IDAT", zlib.compress(data, 9))
    png += potongan(b"IEND", b"")
    path.write_bytes(png)


if __name__ == "__main__":
    TUJUAN.mkdir(parents=True, exist_ok=True)
    daftar = [
        ("icon-192.png", 192, 1.0, True),
        ("icon-512.png", 512, 1.0, True),
        ("icon-maskable-512.png", 512, 0.72, False),  # zona aman maskable ±80%
        ("apple-touch-icon.png", 180, 0.9, False),     # iOS membulatkan sendiri
    ]
    for nama, n, skala, bulat in daftar:
        tulis_png(TUJUAN / nama, n, gambar(n, skala, bulat))
        print("dibuat:", TUJUAN / nama)
