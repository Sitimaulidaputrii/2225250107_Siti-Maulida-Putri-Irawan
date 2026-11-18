# Panduan Analisis Data

Semua perhitungan dapat dilakukan dengan skrip [tools/analisis/analisis_data.py](../../tools/analisis/analisis_data.py). Skrip ini hanya memakai pustaka bawaan Python, jadi tidak perlu memasang pustaka apa pun. Contoh file ada di [tools/analisis/contoh/](../../tools/analisis/contoh/). File CSV boleh memakai pemisah koma atau titik koma (format Excel Indonesia), dan desimal boleh memakai koma.

Jalankan dari folder proyek:

```powershell
python tools/analisis/analisis_data.py <perintah> <file.csv> [opsi]
```

## 1. Kevalidan — Aiken's V

**Format** `validasi.csv`: kolom `butir`, lalu satu kolom per validator berisi skor 1–4.

```powershell
python tools/analisis/analisis_data.py validasi validasi.csv --kategori 4 --terendah 1
```

- Rumus: `V = Σ(r − lo) / [n(c − 1)]`.
- Kriteria: bandingkan V tiap butir dengan **nilai kritis tabel Aiken** untuk jumlah validator (n) dan kategori (c) yang dipakai. Sebagai pelengkap, rata-rata skor ≥ 3,25 dari 4 dapat dikategorikan "sangat valid" (sesuaikan dengan acuan yang dipakai di prodi).

## 2. Kepraktisan — Angket & SUS

**Format** `sus.csv`: `siswa,q1,…,q10` (skor 1–5).

```powershell
python tools/analisis/analisis_data.py sus sus.csv
python tools/analisis/analisis_data.py reliabel sus.csv
```

- SUS: butir ganjil (r − 1), butir genap (5 − r), jumlah × 2,5 → 0–100. Nilai **≥ 68** berarti di atas rata-rata; kategori mengacu pada Bangor dkk. (2009).
- Bagian A angket respon (skala 1–4): rata-rata per butir; ≥ 3,0 = praktis.

## 3. Keefektifan — N-gain & Uji-t

**Format** `tes.csv`: `siswa,pretest,posttest`.

```powershell
python tools/analisis/analisis_data.py tes tes.csv --maks 100
```

Keluaran:
- **N-gain** individu dan N-gain kelas ⟨g⟩ (Hake, 1998): tinggi ≥ 0,7; sedang 0,3–0,7; rendah < 0,3.
- **Uji-t berpasangan**: t, derajat bebas, nilai p dua sisi, dan ukuran efek *d* Cohen.
- Uji normalitas (Shapiro–Wilk) tidak disediakan. Jalankan di JASP atau SPSS; jika data tidak normal, pakai uji Wilcoxon.

## 4. Beban Kognitif

Gunakan file **ekspor "Beban kognitif (CSV)"** dari Dasbor Guru. Isinya kolom `kode_siswa,aktivitas,jenis,item,skor,waktu`.

```powershell
python tools/analisis/analisis_data.py beban skala.csv --tes tes.csv --maks 100
```

- Rata-rata usaha mental Paas (1–9) dan rata-rata IL, EL, GL (0–10) per siswa dan keseluruhan.
- Dengan `--tes`, skrip juga menghitung **efisiensi instruksional** `E = (z_posttest − z_usaha) / √2` (Paas & van Merriënboer, 1993). Supaya bisa dipasangkan, kolom `siswa` di `tes.csv` harus memakai kode yang **sama** dengan `kode_siswa` di ekspor.
- Reliabilitas subskala Leppink: susun data menjadi satu baris per siswa dan satu kolom per butir (IL1–IL3, dst.), lalu jalankan `reliabel`.

## 5. Analisis Kesalahan dari Log Aplikasi

Gunakan file **ekspor "Jawaban siswa (CSV)"** dari Dasbor Guru.

```powershell
python tools/analisis/analisis_data.py kesalahan jawaban.csv
```

Keluaran: frekuensi kode kesalahan E1–E8 dan akurasi per modul. Bandingkan frekuensi **E1 (lupa membalik tanda)** di awal dan akhir latihan M4 untuk melihat apakah masalah utama dari wawancara (IL01) berkurang.

## 6. Ringkasan Kriteria Keberhasilan

| Kriteria | Ukuran | Target |
|----------|--------|--------|
| Valid | Aiken's V setiap butir | ≥ nilai kritis tabel |
| Praktis | Rata-rata angket respon; SUS | ≥ 3,0; ≥ 68 |
| Efektif | ⟨g⟩; uji-t | ≥ 0,3 (sedang); p < 0,05 |
| Beban kognitif | EL; GL; efisiensi E | EL rendah (< 5); GL tinggi (> 5); E rata-rata kelas > 0 dibanding kondisi awal/pembanding |
