# TandaTepat — Aplikasi Belajar PtLSV

Aplikasi web progresif (PWA) untuk siswa SMP mempelajari **Pertidaksamaan Linear Satu Variabel**, dirancang berdasarkan Teori Beban Kognitif dan hasil wawancara siswa. Aplikasi dapat dibuka di browser dan **diinstal langsung dari browser** (Android, iOS, desktop) tanpa Play Store atau App Store, serta berjalan *offline*.

- Dokumen perencanaan: [docs/perencanaan/](docs/perencanaan/README.md) (status pengerjaan ada di §8.6 dokumen 08)
- Instrumen penelitian & uji coba: [docs/instrumen/](docs/instrumen/README.md)

## Fitur

**Untuk siswa**
- **7 modul** (M0 Siap-Siap → M6 Soal Cerita). Konten modul ditulis dalam JSON di `frontend/public/konten/`.
- **Contoh langkah demi langkah** yang dibuka satu per ketukan, **contoh berpasangan**, serta garis bilangan dan cek substitusi.
- **Latihan adaptif**: bantuan berkurang bertahap (contoh → lengkapi → mandiri), dengan petunjuk 3 tingkat dan **umpan balik diagnostik E1–E8**.
- **Lab Garis Bilangan**: titik dicerminkan saat dikali bilangan negatif, sehingga siswa *melihat* mengapa tanda dibalik.
- **Soal cerita 5 tahap**: Tandai (stabilo) → Misalkan → Model → Selesaikan → Tafsirkan.
- **Latihan Bebas** (soal acak tanpa batas), **Progresku**, **Kartu Aturan** (tombol ?), dan **Pengaturan** (ukuran huruf, tema gelap, kurangi animasi).
- Tanpa email atau data pribadi. Bergabung ke kelas cukup dengan kode kelas, nama panggilan, dan PIN.

**Untuk guru dan peneliti**
- **Dasbor guru** (`#/guru`) untuk membuat kelas dan melihat tabel siswa (level, akurasi, petunjuk, kesalahan utama) serta distribusi kesalahan.
- Pengaturan per kelas untuk menyalakan/mematikan **prompt penjelasan diri** dan **instrumen beban kognitif** (Paas & Leppink).
- **Ekspor CSV anonim** (kode pseudonim), lalu diolah dengan `tools/analisis/analisis_data.py`.

## Struktur

```
backend/          Server Python (FastAPI + SQLModel): API & menyajikan hasil build frontend
frontend/         Aplikasi JavaScript (Vite + vite-plugin-pwa)
  src/engine/     Mesin matematika (berjalan di perangkat, offline)
  src/components/ Komponen tampilan (garis bilangan, papan tanda, latihan, soal cerita, …)
  src/views/      Halaman (beranda, modul, lab, alat, kelas, guru)
  public/konten/  Materi & soal (JSON)
tools/            Validasi bank soal (SymPy), pembuat ikon, ekspor soal acak
tools/analisis/   Analisis data penelitian (Aiken's V, SUS, N-gain, uji-t, beban kognitif)
docs/             Perencanaan & instrumen penelitian
Dockerfile        Satu image frontend + backend untuk deployment
```

## Menjalankan untuk Pengembangan (Windows / PowerShell)

Prasyarat: Python 3.12+, Node.js LTS, Git.

**1. Backend** (terminal pertama)
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
copy .env.example .env          # lalu isi SECRET_KEY
uvicorn app.main:app --reload --port 8000
```
Dokumentasi API: http://localhost:8000/docs

**2. Frontend** (terminal kedua)
```powershell
cd frontend
npm install
npm run dev
```
Buka http://localhost:5173. Permintaan `/api` otomatis diteruskan ke backend.

## Perintah Penting

| Perintah | Lokasi | Fungsi |
|----------|--------|--------|
| `npm test` | `frontend/` | 151 unit test: mesin, komponen, **validasi otomatis seluruh konten modul** |
| `npm run build` | `frontend/` | Build produksi ke `frontend/dist/` |
| `pytest -q` | `backend/` | 16 tes API (autentikasi, kelas, sinkron idempoten, dasbor, ekspor) |
| `pytest -q tools/analisis` | akar | 13 tes rumus analisis terhadap nilai acuan |
| `python tools/validasi_soal.py` | akar | Periksa kunci & langkah bank soal dengan SymPy |
| `node tools/ekspor_soal_acak.mjs silang 100` lalu `python tools/validasi_soal.py "silang/soal-acak-*.json"` | akar | Periksa silang generator JavaScript dengan SymPy |
| `python tools/analisis/analisis_data.py --help` | akar | Analisis data uji coba |

## Mode Produksi

**Tanpa Docker** (satu server):
```powershell
cd frontend; npm run build; cd ..\backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**Dengan Docker:**
```bash
docker build -t tandatepat .
docker run -p 8000:8000 -e SECRET_KEY="<acak>" -v tandatepat-data:/data tandatepat
```

Agar dapat diinstal di HP, aplikasi harus diakses lewat **HTTPS**. Lihat [panduan deployment](docs/perencanaan/10-instalasi-dan-deployment.md).
