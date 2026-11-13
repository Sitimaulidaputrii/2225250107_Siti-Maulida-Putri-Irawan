# 08 — Rencana Pengembangan

## 8.1 Model Pengembangan: ADDIE

| Tahap | Kegiatan | Keluaran | Status |
|-------|----------|----------|--------|
| **Analysis** | Wawancara siswa (S01) ✔, tambahan wawancara 3–5 siswa + 1 guru, tes diagnostik, analisis CP/ATP & buku paket | Dokumen 01 (diperbarui) | Sebagian selesai |
| **Design** | Prinsip CLT → keputusan desain, TP & alur modul, bank soal, wireframe, arsitektur | Dokumen 02–07, prototipe Figma/kertas | Dokumen ini |
| **Development** | Pengodean frontend & backend, input konten, validasi ahli, revisi | Aplikasi versi beta | |
| **Implementation** | Uji coba perorangan → kelompok kecil → lapangan terbatas | Data kepraktisan & keefektifan | |
| **Evaluation** | Formatif di setiap tahap + sumatif (lihat dokumen 09) | Laporan evaluasi, versi final | |

> Alternatif yang juga lazim di penelitian pengembangan pendidikan matematika: model **4D** (Thiagarajan: *Define–Design–Develop–Disseminate*). Pilih sesuai arahan dosen pembimbing; isi dokumen ini tetap dapat dipetakan ke model tersebut.

## 8.2 Jadwal Indikatif (16 Minggu)

| Minggu | Kegiatan | Tonggak |
|--------|----------|---------|
| 1 | Melengkapi analisis: wawancara tambahan, tes diagnostik, analisis ATP | Analisis final |
| 2 | Finalisasi desain pembelajaran & bank soal; uji prototipe kertas/Figma ke 3 siswa | Prototipe tervalidasi awal |
| 3 | **Sprint 0** — persiapan: Git repo, Vite + PWA kosong, FastAPI kosong, CI sederhana, deploy "Halo Dunia" | Aplikasi kosong dapat diinstal di HP |
| 4–5 | **Sprint 1** — mesin matematika (`pecahan`, `parser`, `penyelesai`, `diagnosis`) + unit test; skrip validasi Python | Semua soal lolos validasi otomatis |
| 6–7 | **Sprint 2** — komponen inti: garis bilangan SVG, papan tanda, langkah-demi-langkah, kartu aturan; layar M0–M3 | Siswa dapat belajar M0–M3 *offline* |
| 8–9 | **Sprint 3** — M4 (fokus), Lab Garis Bilangan, latihan berjenjang + fading + umpan balik diagnostik | Versi alfa (M0–M4) |
| 10 | **Sprint 4** — M5, M6 soal cerita (stabilo, tabel Diketahui–Ditanya, model), prompt penjelasan diri | Fitur siswa lengkap |
| 11 | **Sprint 5** — backend: akun guru, kelas, sinkron progres, dasbor guru, ekspor CSV, instrumen beban kognitif | Versi beta |
| 12 | **Validasi ahli** (materi, media/desain, pembelajaran) | Skor & saran validator |
| 13 | Revisi I + uji coba perorangan (3 siswa) | Revisi tercatat |
| 14 | Revisi II + uji coba kelompok kecil (6–10 siswa) | Data kepraktisan |
| 15 | Uji lapangan terbatas (1 kelas): pretest–pembelajaran–posttest + angket | Data keefektifan & beban kognitif |
| 16 | Analisis data, revisi akhir, dokumentasi & laporan | Produk final + laporan |

Sesuaikan dengan kalender akademik sekolah (hindari minggu ujian/libur).

## 8.3 Definisi Selesai (*Definition of Done*) per Fitur

- Berfungsi di Chrome Android dan satu browser desktop.
- Berfungsi dalam mode pesawat (*offline*) bila fitur itu bukan fitur server.
- Lolos unit test terkait; tidak ada galat di konsol.
- Teks sudah dibaca ulang: ≤ 4 kalimat per segmen, ≤ 2 kalimat per langkah.
- Kontras & ukuran target sentuh sesuai panduan (dokumen 06).

## 8.4 Pembagian Prioritas (MoSCoW)

| Must (wajib, versi 1) | Should | Could | Won't (versi 1) |
|-----------------------|--------|-------|-----------------|
| PWA terpasang & offline; M0–M6; contoh bertahap; latihan berjenjang + fading; umpan balik E1–E8; garis bilangan; stabilo soal cerita | Akun guru & kelas; sinkron; dasbor; prompt penjelasan diri; skala beban kognitif | Latihan acak tak terbatas; mode gelap; ekspor CSV; APK *sideload* | Materi selain PtLSV; papan peringkat; video; chat |

## 8.5 Manajemen Risiko

| Risiko | Kemungkinan | Dampak | Mitigasi |
|--------|-------------|--------|----------|
| Waktu pengodean melebihi rencana | Sedang | Tinggi | Kerjakan fitur **Must** dulu; backend/dasbor guru dapat ditunda karena aplikasi siswa berfungsi lokal |
| Parser/penyelesai salah menilai jawaban benar | Sedang | Tinggi | Unit test dari seluruh bank soal; validasi silang dengan SymPy; tombol "Laporkan soal" |
| iOS membatasi fitur PWA (mis. tidak ada prompt instal otomatis) | Tinggi | Rendah | Tampilkan panduan "Tambahkan ke Layar Utama"; fitur inti tetap jalan di Safari |
| Data siswa hilang saat browser membersihkan penyimpanan | Rendah | Sedang | Minta `navigator.storage.persist()`; sinkron ke server bila tergabung kelas |
| Layanan hosting gratis berubah kebijakan/berhenti | Sedang | Sedang | Frontend statis mudah dipindah; backend dikemas agar dapat dijalankan di host lain (Dockerfile) |
| Hanya 1 responden pada analisis | Tinggi | Sedang | Wawancara tambahan & tes diagnostik di minggu 1 |
| Izin sekolah/orang tua untuk uji coba | Sedang | Tinggi | Urus surat izin sejak minggu 1; tidak mengumpulkan data pribadi |
| Fitur terlalu banyak → tampilan ramai (bertentangan dengan EL03) | Sedang | Tinggi | Uji prototipe dengan siswa; patuhi daftar "sengaja tidak dimasukkan" (dokumen 02) |

## 8.6 Alur Kerja Git

- Cabang `main` selalu dapat di-*deploy*; fitur baru di cabang `fitur/<nama>`.
- Pesan *commit* singkat berbahasa Indonesia, mis. `tambah diagnosis E1 dan E2`.
- GitHub Actions: jalankan `pytest`, `vitest`, dan `python tools/validasi_soal.py` di setiap *push*.
