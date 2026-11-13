# 09 — Rencana Evaluasi & Uji Coba

Kualitas produk dinilai dari tiga kriteria yang umum dalam penelitian pengembangan (Nieveen, 1999): **kevalidan**, **kepraktisan**, dan **keefektifan** — ditambah **beban kognitif** sebagai fokus penelitian ini.

## 9.1 Kevalidan — Validasi Ahli

| Validator | Jumlah | Aspek yang dinilai |
|-----------|--------|--------------------|
| Ahli materi (dosen matematika / guru senior) | 1–2 | Kebenaran konsep & kunci, kesesuaian CP/TP, urutan materi, kualitas soal cerita, ketepatan umpan balik |
| Ahli media / desain | 1–2 | Tampilan, navigasi, keterbacaan, konsistensi, kinerja, kemudahan instalasi |
| Ahli pembelajaran / CLT (opsional) | 1 | Kesesuaian desain dengan prinsip beban kognitif (gunakan matriks dokumen 02 sebagai daftar cek) |

- Instrumen: lembar validasi skala Likert 1–4 atau 1–5 + kolom saran.
- Analisis: rata-rata skor per aspek, atau **indeks Aiken's V** per butir:
  `V = Σ(r − lo) / [n(c − 1)]`, dengan `r` = skor validator, `lo` = skor terendah, `c` = banyak kategori, `n` = banyak validator.
- Kriteria: tentukan ambang (mis. rata-rata ≥ 3,25 dari 4 = "valid"; V ≥ batas tabel Aiken untuk n dan c yang dipakai).

## 9.2 Kepraktisan

| Tahap | Peserta | Metode | Data |
|-------|---------|--------|------|
| Uji perorangan | 3 siswa (kemampuan tinggi/sedang/rendah) | *Think-aloud* + observasi | Kendala, kebingungan, komentar |
| Uji kelompok kecil | 6–10 siswa | Angket respon siswa + **System Usability Scale (SUS)** | Skor SUS (0–100; ≥ 68 di atas rata-rata) |
| Guru | 1–2 guru | Angket kepraktisan + wawancara | Kemudahan dipakai di kelas |

Contoh butir angket respon siswa (Likert 1–4), dipetakan ke temuan wawancara:
1. Penjelasan setiap langkah mudah saya ikuti. *(EL04)*
2. Saya bisa mengulang langkah yang belum saya pahami. *(EL04, DS02)*
3. Garis bilangan membantu saya memahami himpunan penyelesaian. *(EL02)*
4. Tampilan aplikasi tidak terlalu ramai. *(EL03, DS03)*
5. Saya sekarang tahu kapan tanda pertidaksamaan harus dibalik. *(IL01)*
6. Fitur menandai memudahkan saya menemukan informasi di soal cerita. *(EL05)*
7. Petunjuk saat salah membantu saya memperbaiki jawaban. *(IL05)*
8. Latihan dari mudah ke sulit membantu saya. *(GL05)*
9. Saya bisa memakai aplikasi tanpa internet. *(teknis)*
10. Saya mudah menginstal aplikasi di HP saya. *(teknis)*

## 9.3 Keefektifan

- **Desain:** *one-group pretest–posttest* (uji lapangan terbatas, 1 kelas). Bila memungkinkan, tambahkan kelas pembanding (kuasi-eksperimen).
- **Tes:** 2 paket paralel (pretest & posttest), 8–10 soal mencakup TP1–TP6, termasuk ≥ 3 soal yang menuntut pembalikan tanda dan 2 soal cerita. Validasi butir oleh ahli; uji reliabilitas bila sampel memadai.
- **Analisis:**
  - **N-gain (Hake):** `g = (posttest − pretest) / (skor maks − pretest)`; kategori: g ≥ 0,7 tinggi; 0,3 ≤ g < 0,7 sedang; g < 0,3 rendah.
  - Uji-t berpasangan (atau Wilcoxon bila tidak normal).
  - **Analisis kesalahan:** bandingkan frekuensi E1 (lupa balik tanda) sebelum dan sesudah — indikator langsung keberhasilan terhadap masalah utama wawancara.
- **Data log aplikasi** (otomatis): akurasi per level, jumlah petunjuk, penggunaan contoh, durasi.

## 9.4 Pengukuran Beban Kognitif

| Instrumen | Kapan | Keterangan |
|-----------|-------|------------|
| **Skala usaha mental Paas (1992)** — 1 butir, skala 1–9 ("Seberapa besar usaha mental yang kamu keluarkan?") | Setelah setiap set latihan (di dalam aplikasi) | Cepat, tidak mengganggu |
| **Kuesioner Leppink dkk. (2013)** — 10 butir: 3 IL, 3 EL, 4 GL, skala 0–10 | Akhir modul M4 & akhir pembelajaran | Diadaptasi & diterjemahkan ke Bahasa Indonesia, disederhanakan untuk siswa SMP, divalidasi ahli bahasa/pembelajaran |
| **Wawancara pasca-uji** dengan format kode yang sama (IL/EL/GL/DS) | Setelah uji lapangan, 3–5 siswa | Membandingkan langsung dengan temuan awal S01 |

**Harapan hasil** (hipotesis desain):
- EL rendah (tampilan ringkas, langkah bertahap).
- IL terkelola: skor IL pada M4 menurun dari awal ke akhir latihan.
- GL relatif tinggi (penjelasan diri, contoh berpasangan).
- **Efisiensi instruksional** (Paas & van Merriënboer, 1993): `E = (z_kinerja − z_usaha) / √2`; nilai positif menunjukkan kinerja tinggi dengan usaha mental relatif rendah.

## 9.5 Evaluasi Teknis

| Uji | Alat | Target |
|-----|------|--------|
| Audit PWA, kinerja, aksesibilitas | Lighthouse (Chrome DevTools) | Skor ≥ 90 untuk Performa, Aksesibilitas, *Best Practices*; PWA dapat diinstal |
| Offline | DevTools → Network: *Offline* / mode pesawat | Semua fitur siswa berjalan |
| Kebenaran penilaian | `vitest` + `validasi_soal.py` | 100% bank soal lolos; jawaban ekuivalen (mis. `−2 ≤ x`) diterima |
| Perangkat nyata | ≥ 2 HP Android (kelas bawah & menengah) + 1 iPhone bila ada | Tidak ada tampilan terpotong di lebar 320–414 px |
| API | `pytest` + Swagger `/docs` | Semua endpoint teruji |

## 9.6 Etika Penelitian

- Surat izin sekolah, persetujuan orang tua (*informed consent*) dan persetujuan siswa (*assent*).
- Partisipasi sukarela; siswa boleh berhenti kapan saja tanpa konsekuensi nilai.
- Data dianonimkan (kode S01, S02, …); rekaman disimpan aman dan dihapus setelah penelitian selesai sesuai ketentuan kampus.
