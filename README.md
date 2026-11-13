# TandaTepat — Aplikasi Belajar PtLSV

Aplikasi web progresif (PWA) untuk siswa SMP mempelajari **Pertidaksamaan Linear Satu Variabel**, dirancang berdasarkan Teori Beban Kognitif. Dapat dibuka di browser dan **diinstal langsung dari browser** (Android, iOS, desktop) tanpa Play Store / App Store, serta berjalan *offline*.

Dokumen perencanaan lengkap: [docs/perencanaan/](docs/perencanaan/README.md)

## Struktur

```
backend/    Server Python (FastAPI) — API + menyajikan hasil build frontend
frontend/   Aplikasi JavaScript (Vite + vite-plugin-pwa)
tools/      Skrip Python: validasi bank soal (SymPy), pembuat ikon
docs/       Dokumen perencanaan
```

## Menjalankan untuk Pengembangan (Windows / PowerShell)

Prasyarat: Python 3.12+, Node.js LTS, Git.

**1. Backend** (terminal pertama)
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
uvicorn app.main:app --reload --port 8000
```
Dokumentasi API: http://localhost:8000/docs

**2. Frontend** (terminal kedua)
```powershell
cd frontend
npm install
npm run dev
```
Buka http://localhost:5173 — permintaan `/api` otomatis diteruskan ke backend.

## Perintah Penting

| Perintah | Lokasi | Fungsi |
|----------|--------|--------|
| `pytest -q` | `backend/` | Uji backend |
| `npm test` | `frontend/` | Uji frontend (Vitest) |
| `npm run build` | `frontend/` | Build produksi ke `frontend/dist/` |
| `python tools/validasi_soal.py` | akar | Periksa kunci & langkah semua soal di `frontend/public/konten/` |
| `python tools/buat_ikon.py` | akar | Membuat ulang ikon PWA |

## Mode Produksi (satu server)

```powershell
cd frontend; npm run build; cd ..\backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```
FastAPI menyajikan aplikasi di `/` dan API di `/api/...`. Untuk dapat diinstal di HP, aplikasi harus diakses lewat **HTTPS** — lihat [docs/perencanaan/10-instalasi-dan-deployment.md](docs/perencanaan/10-instalasi-dan-deployment.md).

## Status

**Sprint 0 selesai:** kerangka PWA dapat diinstal & offline, FastAPI dengan endpoint kesehatan, validator bank soal, CI.

**Sprint 1 selesai:** mesin matematika di [frontend/src/engine/](frontend/src/engine/) — semuanya berjalan di perangkat (offline):

| Modul | Fungsi |
|-------|--------|
| `pecahan.js` | Bilangan rasional eksak (tanpa galat desimal); membaca `2,5`, `−3/4` |
| `parser.js` | Mengurai `-3x + 5 ≤ 11`, `2(x − 3) < 5x + 9`, `x/2 + 1 ≥ 4`, `14.000 + 4.000x ≤ 50.000`; pesan galat berbahasa Indonesia |
| `penyelesai.js` | Menyelesaikan, uji ekuivalensi, uji substitusi, membuat langkah penyelesaian bertahap |
| `diagnosis.js` | Mengenali kesalahan E1–E8 dan memberi satu umpan balik spesifik |
| `generator.js` | Soal acak level 1–4 berjawaban bulat |
| `adaptif.js` | Aturan *fading* (contoh → lengkapi → mandiri) dan naik level |

Diuji dengan 128 unit test (`npm test`) dan diperiksa silang dengan SymPy:
```powershell
node tools/ekspor_soal_acak.mjs silang 100
python tools/validasi_soal.py "silang/soal-acak-*.json"
```

**Sprint 2 selesai:** komponen tampilan dan modul M0–M3 dapat dipelajari penuh (offline).

| Komponen | Fungsi |
|----------|--------|
| [garisBilangan.js](frontend/src/components/garisBilangan.js) | Garis bilangan SVG statis & interaktif (titik, bulatan, arah) |
| [papanTanda.js](frontend/src/components/papanTanda.js) | Tombol < > ≤ ≥ + papan angka; juga papan ketik fisik |
| [langkahDemiLangkah.js](frontend/src/components/langkahDemiLangkah.js) | Contoh dibuka satu langkah per ketukan + garis bilangan + cek substitusi |
| [soal.js](frontend/src/components/soal.js) | Butir: pilihan, isian, memenuhi, jawab, garis, bandingkan |
| [latihan.js](frontend/src/components/latihan.js) | Latihan adaptif (fading), petunjuk 3 tingkat, diagnosis kesalahan |
| [kartuAturan.js](frontend/src/components/kartuAturan.js) | Kartu ringkas, dibuka dari tombol **?** di setiap layar |
| [views/modul.js](frontend/src/views/modul.js) | Pemutar modul: materi, contoh, latihan, kuis (+ remedial) |

Konten modul ada di `frontend/public/konten/modul-M*.json` dan divalidasi otomatis oleh `npm test`.

Berikutnya — **Sprint 3:** M4 Kali & Bagi (fokus utama), Lab Garis Bilangan, contoh berpasangan.
