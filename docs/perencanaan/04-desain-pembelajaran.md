# 04 — Desain Pembelajaran & Konten

## 4.1 Acuan Kurikulum

- **Kurikulum Merdeka, Fase D (kelas VII–IX)**, elemen **Aljabar**: peserta didik dapat menyelesaikan persamaan dan pertidaksamaan linear satu variabel.
- Kutip rumusan CP resmi dari dokumen CP terbaru (Keputusan Kepala BSKAP tentang Capaian Pembelajaran) dan sesuaikan kelas dengan ATP sekolah tempat uji coba. *(Siswa S01 mempelajarinya di kelas VIII; beberapa buku menempatkannya di kelas VII.)*

## 4.2 Tujuan Pembelajaran (TP)

| Kode | Tujuan pembelajaran | Modul |
|------|---------------------|-------|
| TP0 | Melakukan operasi hitung bilangan bulat (termasuk negatif) dan menyelesaikan PLSV sederhana | M0 Siap-Siap |
| TP1 | Mengenali kalimat pertidaksamaan dan arti tanda `<`, `>`, `≤`, `≥` | M1 |
| TP2 | Menyajikan himpunan penyelesaian pada garis bilangan dengan bulatan dan arsiran yang tepat | M2 |
| TP3 | Menerapkan sifat penjumlahan/pengurangan kedua ruas tanpa mengubah tanda | M3 |
| TP4 | Menjelaskan dan menerapkan aturan perkalian/pembagian kedua ruas dengan bilangan positif dan negatif | M4 |
| TP5 | Menyelesaikan PtLSV bentuk beragam (variabel di dua ruas, tanda kurung, pecahan sederhana) | M5 |
| TP6 | Memodelkan dan menyelesaikan masalah kontekstual (soal cerita) yang berkaitan dengan PtLSV | M6 |

## 4.3 Alur Modul (Urutan Sederhana → Kompleks)

```
M0 Siap-Siap (prasyarat)
   ↓
M1 Mengenal Pertidaksamaan ── M2 Garis Bilangan
   ↓
M3 Tambah & Kurang Kedua Ruas  (tanda TETAP)
   ↓
M4 Kali & Bagi Kedua Ruas      (positif: TETAP | negatif: DIBALIK)   ← fokus utama
   ↓
M5 Bentuk Beragam              (variabel dua ruas, kurung, pecahan)
   ↓
M6 Soal Cerita                 (tandai → model → selesaikan → tafsirkan)
   ↓
Uji Akhir Modul + Kartu Ringkasan
```

Pola tiap modul (konsisten agar tidak menambah beban ekstrinsik):

```
[Materi singkat 3–7 segmen] → [Contoh lengkap bertahap] → [Contoh berpasangan]
→ [Latihan berbantuan (fading)] → [Latihan mandiri] → [Cek cepat 3 soal]
```

## 4.4 Rincian Konten per Modul

### M0 — Siap-Siap
- Kuis: `−3 + 7`, `−5 − 4`, `(−6) × 3`, `(−12) : (−4)`, `x + 4 = 10`, `3x − 2 = 13`, `−2x = 8`.
- Kartu ringkas: aturan tanda perkalian/pembagian bilangan bulat; prinsip "lakukan hal yang sama pada kedua ruas" dari PLSV.

### M1 — Mengenal Pertidaksamaan
- Segmen: arti `<`, `>`, `≤`, `≥` dengan kalimat sehari-hari ("paling sedikit", "tidak lebih dari", "kurang dari", "minimal", "maksimal").
- Visual: timbangan yang tidak seimbang (sesuai buku paket siswa — konsisten dengan pengalaman belajar sebelumnya).
- Latihan: menerjemahkan frasa ke tanda; menentukan apakah suatu nilai memenuhi pertidaksamaan (uji substitusi).

### M2 — Garis Bilangan
- Bulatan **terbuka** (○) untuk `<` dan `>`; bulatan **tertutup** (●) untuk `≤` dan `≥`.
- Arah arsiran: ke kanan untuk `x > a` / `x ≥ a`; ke kiri untuk `x < a` / `x ≤ a`.
- Catatan semesta: bila semesta bilangan bulat/cacah, himpunan penyelesaian ditulis dengan titik-titik terpisah, mis. `{4, 5, 6, …}`.

### M3 — Tambah & Kurang Kedua Ruas
- Eksplorasi: `3 < 5` → tambah 4 → `7 < 9` (tanda tetap); kurang 10 → `−7 < −5` (tanda tetap).
- Contoh lengkap: `x + 5 > 12` → `x > 7`.
- Penekanan miskonsepsi E2: **memindahkan suku tidak membalik tanda**.

### M4 — Kali & Bagi Kedua Ruas (Inti)
**Segmen eksplorasi (sebelum aturan diberikan):**
1. `2 < 6`. Kalikan 3 → `6 ? 18`. Siswa memilih tanda → `6 < 18` (tetap).
2. `2 < 6`. Kalikan −1 → `−2 ? −6`. Garis bilangan menampilkan pencerminan: 2 berada di kiri 6, tetapi −2 berada di **kanan** −6 → `−2 > −6` (dibalik).
3. Coba sendiri dengan pasangan bilangan lain (3–4 kali) → siswa menyimpulkan aturan.

**Aturan (kartu ringkas):**
> Jika kedua ruas **dikali atau dibagi bilangan negatif**, tanda pertidaksamaan **dibalik**.
> `<` ↔ `>` dan `≤` ↔ `≥`.
> Menambah, mengurangi, atau mengali/membagi dengan bilangan positif → tanda **tetap**.

**Contoh lengkap bertahap — `−3x + 5 ≤ 11`:**
| Langkah | Baris aljabar | Penjelasan (ditempel di samping baris) |
|---------|---------------|-----------------------------------------|
| 1 | `−3x + 5 ≤ 11` | Soal awal. Suku x berwarna biru. |
| 2 | `−3x + 5 − 5 ≤ 11 − 5` | Kurangi kedua ruas dengan 5. Tanda **tetap**. |
| 3 | `−3x ≤ 6` | Hasil penyederhanaan. |
| 4 | `−3x : (−3) ≥ 6 : (−3)` | Bagi kedua ruas dengan **−3** (negatif) → tanda **dibalik** (sorot oranye). |
| 5 | `x ≥ −2` | Hasil akhir. |
| 6 | Garis bilangan: ● di −2, arsir ke kanan | `≥` → bulatan tertutup, arah ke kanan. |
| 7 | Cek: x = 0 → `−3(0) + 5 = 5 ≤ 11` ✔ | Uji satu nilai untuk memastikan arah benar. |

**Contoh berpasangan** (ditampilkan berdampingan):
| A — koefisien positif | B — koefisien negatif |
|-----------------------|-----------------------|
| `3x + 5 ≤ 11` | `−3x + 5 ≤ 11` |
| `3x ≤ 6` | `−3x ≤ 6` |
| `x ≤ 2` (tanda tetap) | `x ≥ −2` (tanda dibalik) |

Prompt penjelasan diri: *"Apa perbedaan langkah terakhir A dan B? Mengapa?"*

**Strategi alternatif yang juga diajarkan:** pindahkan suku x ke ruas yang koefisiennya menjadi positif (mis. `−3x ≤ 6` → `−6 ≤ 3x` → `−2 ≤ x` → `x ≥ −2`). Ini membantu siswa yang sering lupa membalik tanda, dan sekaligus menunjukkan bahwa kedua cara menghasilkan jawaban sama.

### M5 — Bentuk Beragam
- Variabel di kedua ruas: `5x − 2 ≥ 3x + 6` → `x ≥ 4`.
- Tanda kurung: `2(x − 3) < 5x + 9` → `−3x < 15` → `x > −5`.
- Pecahan sederhana: `x/2 + 1 ≥ 4` → `x ≥ 6`.
- Tombol **"Mulai dari mana?"** (EL01) memberi pertanyaan pemandu:
  1. Apakah ada tanda kurung? → uraikan dulu.
  2. Apakah ada pecahan? → kalikan kedua ruas dengan penyebut (positif).
  3. Kumpulkan suku x di satu ruas, konstanta di ruas lain.
  4. Bagi dengan koefisien x — **cek: negatif? balik tanda!**

### M6 — Soal Cerita
Tahapan tetap (D14):
1. **Tandai** — stabilo angka dan pertanyaan.
2. **Diketahui / Ditanya / Misalkan x = …**
3. **Model** — pilih/tulis pertidaksamaan; kamus frasa tersedia ("paling banyak" = `≤`, "paling sedikit" = `≥`, "lebih dari" = `>`, "kurang dari" = `<`).
4. **Selesaikan** — menggunakan mode langkah.
5. **Tafsirkan** — jawaban dalam konteks (mis. banyak buku harus bilangan cacah → paling banyak 9 buku).

## 4.5 Peta Miskonsepsi & Umpan Balik

| Kode | Pola jawaban siswa (contoh untuk `−2x > 8`) | Umpan balik |
|------|---------------------------------------------|-------------|
| E1 | `x > −4` | "Hasil hitungmu sudah benar (−4). Coba cek: kamu membagi dengan bilangan **negatif**. Apa yang harus terjadi pada tanda?" |
| E2 | `2x + 3 > 9` dijawab `x < 3` | "Kamu membagi dengan 2 (positif). Tanda tidak perlu dibalik. Ingat: hanya kali/bagi **negatif** yang membalik tanda." |
| E3 | `x < 4` (dari `−2x > 8`) | "Arah tandamu sudah tepat! Periksa lagi pembagian 8 : (−2)." |
| E4 | `x + 5 > 12` → `x > 17` | "Saat 5 dipindah ke kanan, ia menjadi pengurangan: 12 − 5." |
| E5 | Bulatan tertutup untuk `x < −4` | "Tanda `<` tidak termasuk −4, jadi bulatannya **terbuka**." |
| E6 | Arsir ke kanan untuk `x < −4` | "x **kurang dari** −4 berarti bilangan di sebelah **kiri** −4." |
| E7 | "paling banyak" ditulis `≥` | "Paling banyak berarti tidak boleh melebihi → `≤`." |
| E8 | Jawaban `x ≤ 9,5` untuk banyak buku | "Banyak buku harus bilangan cacah. Berapa nilai terbesar yang mungkin?" |

Logika deteksi: mesin pemeriksa menghitung jawaban benar, lalu membandingkan jawaban siswa dengan **jawaban-salah yang diprediksi** untuk tiap kode kesalahan (lihat dokumen 07, bagian Mesin Pemeriksa).

## 4.6 Aturan Fading & Kenaikan Level

| Fase | Bantuan | Syarat lanjut |
|------|---------|---------------|
| Contoh lengkap | Semua langkah tersedia | Siswa membuka semua langkah |
| Lengkapi 1 langkah | 1 langkah (langkah kunci) dikosongkan | 2 benar |
| Lengkapi ≥ 2 langkah | Langkah kunci + 1 langkah lain dikosongkan | 2 benar |
| Mandiri | Hanya soal; petunjuk tersedia bila diminta | 3 benar berturut-turut tanpa petunjuk → naik level |

Bila salah 2× berturut-turut di fase mandiri → otomatis turun satu fase bantuan (tanpa pesan negatif; cukup "Yuk, kita coba dengan bantuan satu langkah dulu").
