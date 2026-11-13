# Dokumen Perencanaan Aplikasi Pembelajaran PtLSV

**Nama kerja aplikasi:** *TandaTepat* — Belajar Pertidaksamaan Linear Satu Variabel (PtLSV) langkah demi langkah
*(nama dapat diganti kapan saja; cukup ubah di `manifest.webmanifest` dan judul halaman)*

**Sasaran pengguna:** siswa SMP (Fase D), guru matematika sebagai pengguna sekunder
**Platform:** Progressive Web App (PWA) — dibuka di browser, dapat **diinstal langsung dari browser** di Android, iOS, Windows, macOS tanpa Play Store / App Store
**Bahasa pemrograman:** JavaScript (aplikasi siswa/frontend) dan Python (server/API + alat validasi bank soal)
**Dasar perancangan:** Teori Beban Kognitif (*Cognitive Load Theory*) + hasil wawancara siswa S01 (7 November 2026)

---

## Daftar Dokumen

| No | Dokumen | Isi pokok |
|----|---------|-----------|
| 01 | [Analisis Kebutuhan](01-analisis-kebutuhan.md) | Sintesis hasil wawancara (IL, EL, GL, DS), masalah utama, persona siswa, keterbatasan data |
| 02 | [Landasan Desain Beban Kognitif](02-landasan-desain-beban-kognitif.md) | Prinsip CLT & multimedia → keputusan desain konkret yang dapat dilacak ke kutipan siswa |
| 03 | [Spesifikasi Kebutuhan Perangkat Lunak](03-spesifikasi-kebutuhan.md) | Kebutuhan fungsional & non-fungsional, *user story*, prioritas (MoSCoW) |
| 04 | [Desain Pembelajaran & Konten](04-desain-pembelajaran.md) | CP, tujuan pembelajaran, alur modul, contoh bertahap, miskonsepsi & umpan balik |
| 05 | [Bank Soal Awal](05-bank-soal.md) | Soal level 1–5 beserta kunci & langkah, format data JSON |
| 06 | [Desain UI/UX](06-desain-ui-ux.md) | Peta situs, wireframe setiap layar, panduan gaya visual, aksesibilitas |
| 07 | [Arsitektur Teknis](07-arsitektur-teknis.md) | Tumpukan teknologi, struktur folder, PWA & offline, model data, API, mesin pemeriksa jawaban |
| 08 | [Rencana Pengembangan](08-rencana-pengembangan.md) | Model ADDIE, jadwal per minggu, sprint, risiko & mitigasi |
| 09 | [Rencana Evaluasi & Uji Coba](09-rencana-evaluasi.md) | Validasi ahli, kepraktisan, keefektifan, pengukuran beban kognitif, instrumen |
| 10 | [Panduan Instalasi & Deployment](10-instalasi-dan-deployment.md) | Menyiapkan lingkungan, menjalankan lokal, hosting, cara siswa menginstal aplikasi |

## Ringkasan Satu Paragraf

Wawancara menunjukkan bahwa kesulitan terbesar siswa ada pada **aturan pembalikan tanda saat mengalikan/membagi dengan bilangan negatif** (beban intrinsik), diperparah oleh **langkah yang terlalu banyak sekaligus, bentuk soal yang berbeda dari contoh, dan soal cerita yang panjang** (beban ekstrinsik). Siswa terbantu oleh **contoh langkah demi langkah, garis bilangan, latihan dari mudah ke sulit, dan menjelaskan ulang dengan kata-kata sendiri** (beban germane). Karena itu aplikasi dirancang sebagai PWA yang **sederhana, ringkas, visual secukupnya**, dengan inti fitur: (1) cek prasyarat, (2) materi tersegmentasi, (3) contoh bertahap yang dibuka satu langkah per ketukan, (4) latihan berjenjang 5 level dengan pemudaran bantuan (*fading*), (5) umpan balik yang mendiagnosis jenis kesalahan, (6) garis bilangan interaktif, dan (7) alat bantu menandai informasi penting pada soal cerita.

## Glosarium Singkat

| Istilah | Arti |
|---------|------|
| PtLSV | Pertidaksamaan Linear Satu Variabel |
| PLSV | Persamaan Linear Satu Variabel (materi prasyarat) |
| IL — *Intrinsic Load* | Beban yang berasal dari kerumitan materi itu sendiri |
| EL — *Extraneous Load* | Beban yang berasal dari cara penyajian yang kurang baik (tidak membantu belajar) |
| GL — *Germane Load* | Beban/usaha mental yang membangun skema (bermanfaat untuk belajar) |
| DS | Kode kebutuhan desain dari siswa (dipakai pada laporan wawancara) |
| PWA | Aplikasi web yang dapat diinstal dan berjalan *offline* |
| *Worked example* | Contoh soal yang dikerjakan lengkap langkah demi langkah |
| *Fading* | Bantuan dikurangi bertahap sampai siswa mengerjakan mandiri |
