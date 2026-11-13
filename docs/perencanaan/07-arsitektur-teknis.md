# 07 — Arsitektur Teknis

## 7.1 Keputusan Utama

| Keputusan | Pilihan | Alasan |
|-----------|---------|--------|
| Jenis aplikasi | **Progressive Web App (PWA)** | Satu kode untuk web, Android, iOS, desktop; dapat diinstal langsung dari browser tanpa Play Store/App Store; berjalan *offline* |
| Frontend | **JavaScript** (ES Modules) + **Vite** sebagai *build tool*, tanpa framework berat | Ringan, mudah dipelajari, cepat dimuat di ponsel kelas menengah |
| PWA | `vite-plugin-pwa` (Workbox) | Membuat *service worker* & *manifest* otomatis |
| Penyimpanan lokal | **IndexedDB** (pustaka `idb`) | Progres tersimpan saat *offline* |
| Matematika tampilan | **KaTeX** | Ringan, dapat di-*cache* untuk *offline* |
| Backend | **Python 3.12 + FastAPI** | Cepat, dokumentasi API otomatis (Swagger), cocok untuk pemula Python |
| ORM & DB | **SQLModel** + **SQLite** (pengembangan/uji coba kecil) → **PostgreSQL** (bila pengguna banyak) | Mudah dimulai, dapat ditingkatkan |
| Autentikasi | JWT (`python-jose` / `pyjwt`), hash `bcrypt` / `argon2` | Standar & aman |
| Alat konten | **Python + SymPy** | Memvalidasi kunci jawaban & membuat soal acak secara otomatis |
| Pengujian | `pytest` (Python), `vitest` (JS), Playwright (uji ujung-ke-ujung, opsional) | |
| Versi kode | Git + GitHub | Riwayat & kolaborasi dengan pembimbing |

> **Alternatif:** jika kelak antarmuka makin kompleks, frontend dapat dipindah ke Svelte atau Vue tanpa mengubah backend. Untuk versi 1, JavaScript murni sudah cukup.

## 7.2 Diagram Arsitektur

```
┌───────────────────────────── Perangkat Siswa ─────────────────────────────┐
│  Browser / PWA terpasang                                                  │
│  ┌───────────────┐   ┌──────────────────┐   ┌───────────────────────────┐ │
│  │ UI (HTML/CSS/ │──▶│ Mesin Pembelajaran│──▶│ IndexedDB                 │ │
│  │ JavaScript)   │   │ - pemeriksa jawab │   │ - progres, percobaan      │ │
│  └───────────────┘   │ - diagnosis error │   │ - antrean sinkron         │ │
│          ▲           │ - fading & level  │   └───────────────────────────┘ │
│          │           └──────────────────┘                ▲                │
│  ┌───────┴─────────────────────────┐                     │                │
│  │ Service Worker (cache konten:   │◀──── konten JSON ───┘                │
│  │ HTML, JS, CSS, KaTeX, soal)     │                                      │
│  └──────────────┬──────────────────┘                                      │
└─────────────────┼─────────────────────────────────────────────────────────┘
                  │ HTTPS (hanya saat daring, untuk sinkron & dasbor guru)
┌─────────────────▼──────────────────── Server ─────────────────────────────┐
│  FastAPI (Python)                                                          │
│  /api/auth  /api/kelas  /api/progres  /api/konten  /api/guru               │
│        │                                                                   │
│  SQLModel ──▶ SQLite / PostgreSQL                                          │
│  (juga melayani file statis hasil build frontend)                          │
└────────────────────────────────────────────────────────────────────────────┘

Alat Pengembang (lokal):  tools/validasi_soal.py  (SymPy)  → konten/*.json
```

**Prinsip *offline-first*:** seluruh logika belajar (pemeriksaan jawaban, diagnosis, fading) berjalan **di perangkat** dengan JavaScript. Server hanya untuk sinkron progres, kelas, dan dasbor guru. Jadi aplikasi tetap berfungsi penuh tanpa internet.

## 7.3 Struktur Folder Proyek

```
Project-Alpro/
├── docs/
│   └── perencanaan/              ← dokumen ini
├── frontend/
│   ├── index.html
│   ├── vite.config.js            ← konfigurasi vite-plugin-pwa
│   ├── package.json
│   ├── public/
│   │   ├── icons/                ← ikon 192, 512, maskable
│   │   └── konten/               ← materi & soal (JSON), hasil validasi
│   │       ├── modul.json
│   │       ├── soal-L1.json … soal-L5.json
│   │       └── prasyarat.json
│   ├── src/
│   │   ├── main.js               ← titik masuk, registrasi SW
│   │   ├── router.js             ← router hash sederhana (#/modul/M4)
│   │   ├── state.js              ← status aplikasi
│   │   ├── db.js                 ← akses IndexedDB
│   │   ├── sync.js               ← antrean sinkron ke server
│   │   ├── api.js                ← fetch ke backend
│   │   ├── engine/
│   │   │   ├── pecahan.js        ← aritmetika bilangan rasional
│   │   │   ├── parser.js         ← mengurai "−3x + 5 <= 11"
│   │   │   ├── penyelesai.js     ← menyelesaikan PtLSV ax + b ? cx + d
│   │   │   ├── diagnosis.js      ← mendeteksi E1–E8
│   │   │   ├── generator.js      ← soal acak L1–L4
│   │   │   └── adaptif.js        ← aturan fading & naik level
│   │   ├── views/
│   │   │   ├── beranda.js  materi.js  contoh.js  latihan.js
│   │   │   ├── soalCerita.js  labGaris.js  progres.js  pengaturan.js
│   │   │   └── guru/  dasbor.js  kelas.js
│   │   ├── components/
│   │   │   ├── garisBilangan.js  ← SVG garis bilangan
│   │   │   ├── papanTanda.js     ← keypad < > ≤ ≥ + angka
│   │   │   ├── langkahDemiLangkah.js
│   │   │   ├── stabilo.js
│   │   │   └── kartuAturan.js
│   │   └── styles/
│   │       └── main.css
│   └── tests/                    ← vitest
├── backend/
│   ├── app/
│   │   ├── main.py               ← aplikasi FastAPI, mount file statis
│   │   ├── config.py             ← pengaturan dari .env
│   │   ├── db.py                 ← engine & sesi
│   │   ├── models.py             ← tabel SQLModel
│   │   ├── schemas.py            ← model request/response
│   │   ├── security.py           ← hash, JWT
│   │   └── routers/
│   │       ├── auth.py  kelas.py  progres.py  guru.py
│   ├── tests/                    ← pytest
│   ├── requirements.txt
│   └── .env.example
├── tools/
│   ├── validasi_soal.py          ← cek kunci jawaban dengan SymPy
│   ├── buat_soal_acak.py         ← generator soal untuk bank soal
│   └── skema_soal.json           ← JSON Schema format soal
└── README.md
```

## 7.4 PWA: Manifest & Service Worker

**`manifest.webmanifest`** (dihasilkan `vite-plugin-pwa`):
```json
{
  "name": "TandaTepat — Belajar PtLSV",
  "short_name": "TandaTepat",
  "lang": "id",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#FFFFFF",
  "theme_color": "#1D4ED8",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

**Strategi cache (Workbox):**
| Sumber | Strategi |
|--------|----------|
| HTML, JS, CSS, ikon, KaTeX | *Precache* saat instal |
| `/konten/*.json` | *Stale-while-revalidate* (pakai cache, perbarui di latar) |
| `/api/*` | *Network-only*; bila gagal, data masuk antrean sinkron di IndexedDB |

**Tombol "Instal Aplikasi"** di halaman: tangkap event `beforeinstallprompt` (Chrome/Edge/Android) lalu tampilkan tombol; untuk iOS tampilkan panduan "Bagikan → Tambahkan ke Layar Utama".

**Pembaruan versi:** saat ada *service worker* baru, tampilkan pesan kecil "Versi baru tersedia — [Muat ulang]".

## 7.5 Model Data

### Di server (SQLModel)
```
Guru(id, email UNIQUE, hash_sandi, nama, dibuat)
Kelas(id, guru_id → Guru, nama, kode UNIQUE(6), pengaturan_json, dibuat)
Siswa(id, kelas_id → Kelas NULL, nama_panggilan, hash_pin, kode_pseudonim UNIQUE, dibuat)
Percobaan(id, siswa_id → Siswa, soal_id, level, fase_bantuan, benar BOOL,
          kode_kesalahan NULL, jumlah_petunjuk, lihat_contoh BOOL,
          durasi_detik, waktu_klien, waktu_server)
Penguasaan(siswa_id, modul, level_tercapai, diperbarui)        ← ringkasan
SkalaBeban(id, siswa_id, aktivitas, jenis('paas'|'leppink'), item, skor, waktu)
```

### Di perangkat (IndexedDB)
```
store "profil"     : { id_lokal, nama_panggilan, kelas_kode?, token? }
store "percobaan"  : seperti tabel Percobaan + status_sinkron
store "penguasaan" : { modul, level, fase, beruntun_benar }
store "pengaturan" : { ukuran_huruf, mode_gelap, kurangi_animasi }
store "antrean"    : permintaan API yang menunggu daring
```

`id` percobaan dibuat di klien (UUID) agar sinkron bersifat **idempoten** (tidak tercatat dua kali).

## 7.6 Rancangan API (REST, JSON)

| Metode | Endpoint | Fungsi | Akses |
|--------|----------|--------|-------|
| POST | `/api/auth/guru/daftar` | Daftar guru | Publik |
| POST | `/api/auth/guru/masuk` | Masuk guru → JWT | Publik |
| POST | `/api/auth/siswa/gabung` | Siswa gabung kelas (kode kelas, nama panggilan, PIN) → JWT | Publik |
| POST | `/api/auth/siswa/masuk` | Masuk siswa (kode kelas, nama panggilan, PIN) | Publik |
| GET | `/api/konten/versi` | Versi konten terbaru | Publik |
| POST | `/api/progres/percobaan` | Kirim kumpulan percobaan (batch) | Siswa |
| GET | `/api/progres/saya` | Ringkasan penguasaan | Siswa |
| POST | `/api/progres/skala-beban` | Kirim skor beban kognitif | Siswa |
| POST | `/api/kelas` | Buat kelas | Guru |
| GET | `/api/kelas` | Daftar kelas guru | Guru |
| PATCH | `/api/kelas/{id}/pengaturan` | Aktif/nonaktif fitur (prompt penjelasan, skala beban) | Guru |
| GET | `/api/guru/kelas/{id}/ringkasan` | Tabel siswa & distribusi kesalahan | Guru |
| GET | `/api/guru/kelas/{id}/ekspor.csv` | Ekspor data anonim | Guru |

Dokumentasi interaktif otomatis tersedia di `/docs` (Swagger UI bawaan FastAPI).

Contoh kerangka endpoint:
```python
# backend/app/routers/progres.py
from fastapi import APIRouter, Depends
from sqlmodel import Session
from ..db import get_session
from ..security import siswa_saat_ini
from ..models import Percobaan
from ..schemas import PercobaanMasuk

router = APIRouter(prefix="/api/progres", tags=["progres"])

@router.post("/percobaan")
def kirim_percobaan(data: list[PercobaanMasuk],
                    siswa=Depends(siswa_saat_ini),
                    sesi: Session = Depends(get_session)):
    diterima = 0
    for p in data:
        if sesi.get(Percobaan, p.id):      # idempoten: lewati yang sudah ada
            continue
        sesi.add(Percobaan(**p.model_dump(), siswa_id=siswa.id))
        diterima += 1
    sesi.commit()
    return {"diterima": diterima}
```

## 7.7 Mesin Pemeriksa Jawaban (JavaScript, di perangkat)

**Representasi:** setiap ruas berbentuk linear `a·x + b` dengan `a, b` bilangan rasional (kelas `Pecahan` agar tidak ada galat desimal).

**Algoritma menyelesaikan `a₁x + b₁ (op) a₂x + b₂`:**
1. `A = a₁ − a₂`, `B = b₂ − b₁` → `A·x (op) B`.
2. Jika `A = 0` → kasus khusus (semua bilangan / tidak ada penyelesaian) — tidak muncul di versi 1, tetapi ditangani.
3. `nilai = B / A`; jika `A < 0` → balik `op`.
4. Hasil: `{ tanda: op', nilai }`.

**Diagnosis (pseudo-kode):**
```js
export function diagnosis(soal, jawabanSiswa) {
  const benar = selesaikan(soal);                 // {tanda, nilai}
  if (sama(jawabanSiswa, benar)) return { benar: true };

  const nilaiSama = jawabanSiswa.nilai.eq(benar.nilai);
  const tandaKebalik = jawabanSiswa.tanda === balik(benar.tanda);
  const perluBalik = koefisienBersih(soal) < 0;   // A < 0 ?

  if (nilaiSama && tandaKebalik && perluBalik)  return { kode: "E1" };
  if (nilaiSama && tandaKebalik && !perluBalik) return { kode: "E2" };
  if (nilaiSama && bedaHanyaInklusif(jawabanSiswa.tanda, benar.tanda))
                                                 return { kode: "E5" };
  if (!nilaiSama && jawabanSiswa.tanda === benar.tanda)
                                                 return { kode: "E3" };
  // cocokkan dengan daftar salah_umum dari file soal
  const cocok = soal.salah_umum?.find(s => sama(s.jawaban, jawabanSiswa));
  return cocok ? { kode: cocok.kode } : { kode: "LAIN" };
}
```
Untuk **mode langkah**, setiap baris yang dimasukkan siswa diperiksa **ekuivalensinya** dengan baris sebelumnya (himpunan penyelesaiannya sama), sehingga siswa boleh memakai urutan langkah yang berbeda dari kunci (mendukung EL01: bentuk/strategi yang berbeda tetap diterima).

## 7.8 Alat Python untuk Konten

`tools/validasi_soal.py` (gambaran):
```python
import json, sys
from pathlib import Path
from sympy import symbols, Lt, Gt, Le, Ge, solve_univariate_inequality
from sympy.parsing.sympy_parser import (
    parse_expr, standard_transformations, implicit_multiplication_application)

x = symbols("x", real=True)
TRANS = standard_transformations + (implicit_multiplication_application,)
RELASI = {"<=": Le, ">=": Ge, "<": Lt, ">": Gt}   # urutan penting: <= sebelum <

def ke_relasi(teks: str):
    """'-3x + 5 <= 11', '2(x-3) < 5x+9', 'x/2 + 1 ≥ 4' -> relasi SymPy."""
    teks = teks.replace("−", "-").replace("≤", "<=").replace("≥", ">=")
    for op, Rel in RELASI.items():
        if op in teks:
            kiri, kanan = teks.split(op, 1)
            baca = lambda s: parse_expr(s, local_dict={"x": x}, transformations=TRANS)
            return Rel(baca(kiri), baca(kanan))
    raise ValueError(f"Tanda pertidaksamaan tidak ditemukan: {teks}")

def cek_file(path: Path) -> int:
    galat = 0
    for soal in json.loads(path.read_text(encoding="utf-8")):
        hp = solve_univariate_inequality(ke_relasi(soal["soal"]), x, relational=False)
        kunci = ke_relasi(f"x {soal['jawaban']['tanda']} {soal['jawaban']['nilai']}")
        hp_kunci = solve_univariate_inequality(kunci, x, relational=False)
        if hp != hp_kunci:
            print(f"[SALAH] {soal['id']}: kunci {kunci}, seharusnya {hp}")
            galat += 1
    return galat

if __name__ == "__main__":
    total = sum(cek_file(Path(p)) for p in sys.argv[1:])
    sys.exit(1 if total else 0)
```
> Pada soal cerita, tulis model tanpa pemisah ribuan (`14000 + 4000x <= 50000`). Skrip juga sebaiknya memvalidasi struktur file terhadap `skema_soal.json` (pustaka `jsonschema`) dan memeriksa bahwa setiap `salah_umum` memang **berbeda** dari kunci.

Skrip ini dijalankan setiap kali bank soal diubah (manual atau otomatis lewat GitHub Actions).

## 7.9 Keamanan & Privasi

- Siswa **tidak** memasukkan nama lengkap, email, nomor HP, foto, atau lokasi.
- Data ekspor guru memakai `kode_pseudonim`, bukan nama panggilan, bila untuk penelitian.
- Semua lalu lintas HTTPS; CORS dibatasi ke domain aplikasi.
- Batasi percobaan masuk (*rate limit*) untuk mencegah tebak PIN.
- Kebijakan privasi singkat berbahasa sederhana ditampilkan saat pertama kali bergabung ke kelas, dan persetujuan orang tua/sekolah diperoleh sebelum uji coba.
