# 10 — Panduan Instalasi & Deployment

## 10.1 Menyiapkan Lingkungan Pengembangan (Windows)

| Perangkat lunak | Versi | Kegunaan |
|-----------------|-------|----------|
| Python | 3.12+ (sudah terpasang di laptop: 3.14) | Backend & alat konten |
| Node.js | LTS terbaru (22.x atau lebih baru) | Menjalankan Vite (frontend) |
| Git | terbaru | Versi kode |
| VS Code | terbaru | Editor (ekstensi: Python, ESLint, Prettier) |
| Google Chrome | terbaru | Uji PWA & DevTools |

## 10.2 Menjalankan Secara Lokal

**Backend (Python/FastAPI):**
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install fastapi "uvicorn[standard]" sqlmodel pyjwt "passlib[bcrypt]" python-dotenv
pip freeze > requirements.txt
uvicorn app.main:app --reload --port 8000
# Dokumentasi API: http://localhost:8000/docs
```

**Frontend (JavaScript/Vite):**
```powershell
cd frontend
npm create vite@latest . -- --template vanilla
npm install
npm install -D vite-plugin-pwa
npm install idb katex
npm run dev
# Buka: http://localhost:5173
```

**Alat konten:**
```powershell
pip install sympy jsonschema
python tools/validasi_soal.py frontend/public/konten/soal-L*.json
```

**Menguji di HP Android pada jaringan Wi-Fi yang sama:** jalankan `npm run dev -- --host`, buka alamat IP laptop di Chrome HP. *Catatan:* fitur instal & *service worker* memerlukan HTTPS (kecuali `localhost`); untuk uji instal di HP gunakan versi yang sudah di-*deploy* atau terowongan HTTPS (mis. Cloudflare Tunnel / ngrok).

## 10.3 Pilihan Deployment

### Opsi A (disarankan untuk awal) — Satu server
FastAPI melayani **API** sekaligus **file statis hasil build frontend**:
```python
# backend/app/main.py (potongan)
from fastapi.staticfiles import StaticFiles
app.mount("/", StaticFiles(directory="../frontend/dist", html=True), name="web")
# daftarkan router /api/... SEBELUM baris mount di atas
```
Langkah:
1. `npm run build` → menghasilkan `frontend/dist/`.
2. Deploy folder proyek ke layanan hosting Python yang mendukung HTTPS (mis. Render, Railway, PythonAnywhere, atau VPS kampus).
3. Atur variabel lingkungan: `SECRET_KEY`, `DATABASE_URL`, `CORS_ORIGINS`.

Kelebihan: satu domain, tidak ada masalah CORS, mudah dikelola.

### Opsi B — Terpisah
- **Frontend statis:** Netlify / Cloudflare Pages / GitHub Pages / Vercel (HTTPS otomatis, gratis).
- **Backend:** Render / Railway / PythonAnywhere.
- Atur `CORS_ORIGINS` di backend ke domain frontend.

Kelebihan: frontend sangat cepat dan tetap hidup walau backend sedang tidur (siswa tetap bisa belajar *offline*).

> Ketentuan paket gratis layanan hosting sering berubah (mis. server "tidur" setelah tidak aktif). Periksa kebijakan terbaru sebelum uji coba, dan uji sehari sebelum dipakai di kelas.

**Basis data:** SQLite cukup untuk uji coba 1–2 kelas. Jika host tidak menyimpan file secara permanen (beberapa layanan gratis menghapus disk saat *restart*), gunakan PostgreSQL terkelola (mis. Neon, Supabase, atau PostgreSQL dari layanan host).

## 10.4 Cara Siswa Menginstal Aplikasi (tanpa Play Store / App Store)

Buat lembar panduan bergambar berisi langkah berikut + **kode QR** menuju alamat aplikasi.

**Android (Chrome):**
1. Pindai kode QR atau buka alamat aplikasi di Chrome.
2. Ketuk tombol **"Instal Aplikasi"** di halaman, atau menu ⋮ → **Instal aplikasi** / **Tambahkan ke layar utama**.
3. Ikon TandaTepat muncul di layar utama; buka sekali saat ada internet agar semua materi tersimpan untuk *offline*.

**iPhone/iPad (Safari):**
1. Buka alamat aplikasi di **Safari**.
2. Ketuk ikon **Bagikan** (kotak dengan panah ke atas) → **Tambahkan ke Layar Utama** → **Tambah**.

**Laptop/PC (Chrome atau Edge):**
- Klik ikon instal (⊕ / monitor dengan panah) di ujung kanan bilah alamat → **Instal**.

## 10.5 (Opsional) File APK untuk Dipasang Manual

Jika sekolah meminta file `.apk` (mis. untuk HP yang dibagikan sekolah):
1. Pastikan PWA sudah ter-*deploy* di HTTPS dan lolos audit Lighthouse.
2. Buka **PWABuilder** (pwabuilder.com) → masukkan URL aplikasi → pilih **Android** → unduh paket. Alternatif berbasis baris perintah: **Bubblewrap** (Google) yang membuat *Trusted Web Activity*.
3. Unggah file `assetlinks.json` yang dihasilkan ke `/.well-known/assetlinks.json` di domain aplikasi agar bilah alamat browser tidak muncul.
4. Bagikan file `.apk`; di HP siswa aktifkan **Izinkan dari sumber ini** saat memasang.

APK ini tetap memuat aplikasi web yang sama, sehingga pembaruan cukup dilakukan di server — tidak perlu membagikan APK baru.

## 10.6 Daftar Periksa Sebelum Uji Coba di Kelas

- [ ] Aplikasi dapat dibuka via HTTPS dan diinstal di ≥ 2 HP Android berbeda.
- [ ] Mode pesawat: materi, contoh, dan latihan tetap berjalan.
- [ ] Kode kelas sudah dibuat; akun guru siap.
- [ ] Semua soal lolos `validasi_soal.py`.
- [ ] Lembar panduan instal + kode QR dicetak.
- [ ] Rencana cadangan bila internet sekolah lambat: siswa menginstal di rumah sehari sebelumnya, atau guru menyiapkan *hotspot*.
- [ ] Surat izin & persetujuan orang tua lengkap.
