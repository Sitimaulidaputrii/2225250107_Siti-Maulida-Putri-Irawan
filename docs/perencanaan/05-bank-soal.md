# 05 — Bank Soal Awal

Semesta pembicaraan: **bilangan real**, kecuali disebutkan lain. Semua kunci perlu diverifikasi ulang otomatis dengan skrip `tools/validasi_soal.py` (SymPy) — lihat dokumen 07.

## 5.1 Level 1 — Satu Langkah, Tanpa Pembalikan Tanda

| ID | Soal | Langkah kunci | Jawaban |
|----|------|---------------|---------|
| L1-01 | `x + 5 > 12` | kurangi 5 | `x > 7` |
| L1-02 | `x − 4 ≤ 3` | tambah 4 | `x ≤ 7` |
| L1-03 | `3x ≤ 15` | bagi 3 | `x ≤ 5` |
| L1-04 | `x + 9 ≥ 2` | kurangi 9 | `x ≥ −7` |
| L1-05 | `4x < −12` | bagi 4 (positif, tanda tetap) | `x < −3` |

## 5.2 Level 2 — Dua Langkah, Koefisien Positif

| ID | Soal | Langkah | Jawaban |
|----|------|---------|---------|
| L2-01 | `2x + 3 > 9` | `2x > 6` | `x > 3` |
| L2-02 | `4x − 7 ≤ 13` | `4x ≤ 20` | `x ≤ 5` |
| L2-03 | `5x + 8 ≥ −2` | `5x ≥ −10` | `x ≥ −2` |
| L2-04 | `3x − 1 < 11` | `3x < 12` | `x < 4` |
| L2-05 | `6 + 2x > 0` | `2x > −6` | `x > −3` |

## 5.3 Level 3 — Koefisien Negatif (Tanda Dibalik) ★ fokus

| ID | Soal | Langkah | Jawaban | Kesalahan yang diantisipasi |
|----|------|---------|---------|------------------------------|
| L3-01 | `−2x > 8` | bagi −2, balik | `x < −4` | E1: `x > −4`; E3: `x < 4` |
| L3-02 | `−3x + 5 ≤ 11` | `−3x ≤ 6` → bagi −3, balik | `x ≥ −2` | E1: `x ≤ −2` |
| L3-03 | `7 − x < 10` | `−x < 3` → kali −1, balik | `x > −3` | E1: `x < −3` |
| L3-04 | `−4x − 2 ≥ 10` | `−4x ≥ 12` | `x ≤ −3` | E1: `x ≥ −3` |
| L3-05 | `−5x + 1 < −14` | `−5x < −15` | `x > 3` | E1: `x < 3`; E3: `x > −3` |
| L3-06 | `12 − 3x ≥ 0` | `−3x ≥ −12` | `x ≤ 4` | E1: `x ≥ 4` |

## 5.4 Level 4 — Bentuk Beragam

| ID | Soal | Langkah | Jawaban |
|----|------|---------|---------|
| L4-01 | `5x − 2 ≥ 3x + 6` | `2x ≥ 8` | `x ≥ 4` |
| L4-02 | `2(x − 3) < 5x + 9` | `2x − 6 < 5x + 9` → `−3x < 15` | `x > −5` |
| L4-03 | `x/2 + 1 ≥ 4` | `x/2 ≥ 3` | `x ≥ 6` |
| L4-04 | `3(2 − x) > x − 10` | `6 − 3x > x − 10` → `−4x > −16` | `x < 4` |
| L4-05 | `(x + 1)/3 ≤ 2` | `x + 1 ≤ 6` | `x ≤ 5` |
| L4-06 | `4x + 7 > 6x − 1` | `−2x > −8` | `x < 4` |

## 5.5 Level 5 — Soal Cerita

**L5-01 (Belanja)**
Budi membawa uang Rp50.000. Ia membeli sebuah kotak pensil seharga Rp14.000 dan beberapa buku tulis seharga Rp4.000 per buah. Berapa paling banyak buku tulis yang dapat dibeli Budi?
- Misalkan x = banyak buku tulis (bilangan cacah).
- Model: `14.000 + 4.000x ≤ 50.000`
- `4.000x ≤ 36.000` → `x ≤ 9`
- **Jawaban:** paling banyak **9 buku tulis**.

**L5-02 (Lift)**
Sebuah lift dapat mengangkut beban paling banyak 500 kg. Operator lift beratnya 60 kg dan akan mengangkut beberapa kotak yang masing-masing beratnya 40 kg. Berapa kotak paling banyak yang dapat diangkut sekali jalan?
- Model: `60 + 40x ≤ 500` → `40x ≤ 440` → `x ≤ 11`
- **Jawaban:** paling banyak **11 kotak**.

**L5-03 (Nilai rata-rata)**
Nilai ulangan Sinta 70 dan 72. Agar rata-rata tiga ulangan paling sedikit 75, berapa nilai minimal ulangan ketiga?
- Model: `(70 + 72 + x)/3 ≥ 75` → `142 + x ≥ 225` → `x ≥ 83`
- **Jawaban:** paling sedikit **83**.

**L5-04 (Keliling)**
Panjang sebuah persegi panjang 5 cm lebih dari lebarnya. Kelilingnya tidak lebih dari 50 cm. Tentukan batas lebarnya.
- Misalkan lebar = x, panjang = x + 5.
- Model: `2(x + (x + 5)) ≤ 50` → `4x + 10 ≤ 50` → `x ≤ 10`
- **Jawaban:** lebar paling besar **10 cm** (dan x > 0).

**L5-05 (Suhu — melibatkan negatif)**
Suhu sebuah ruang pendingin mula-mula 6°C. Setiap jam suhunya turun 3°C. Setelah berapa jam suhunya kurang dari −9°C?
- Model: `6 − 3x < −9` → `−3x < −15` → `x > 5` (tanda dibalik)
- **Jawaban:** setelah **lebih dari 5 jam**.

## 5.6 Format Data Soal (JSON)

Setiap soal disimpan sebagai objek JSON agar dapat dibaca oleh aplikasi (JavaScript) dan divalidasi oleh Python.

```json
{
  "id": "L3-02",
  "level": 3,
  "modul": "M4",
  "jenis": "aljabar",
  "soal": "-3x + 5 <= 11",
  "semesta": "real",
  "jawaban": { "tanda": ">=", "nilai": "-2" },
  "langkah": [
    { "ekspresi": "-3x + 5 <= 11", "penjelasan": "Soal awal." },
    { "ekspresi": "-3x <= 6", "operasi": { "jenis": "kurang", "nilai": "5" }, "penjelasan": "Kurangi kedua ruas dengan 5. Tanda tetap." },
    { "ekspresi": "x >= -2", "operasi": { "jenis": "bagi", "nilai": "-3" }, "penjelasan": "Bagi dengan -3 (negatif), tanda dibalik.", "kunci": true }
  ],
  "petunjuk": [
    "Suku mana yang mengandung x? Pindahkan konstanta dulu.",
    "Kamu akan membagi dengan -3. Bilangan itu positif atau negatif?",
    "Lihat contoh serupa: -2x > 8."
  ],
  "salah_umum": [
    { "kode": "E1", "jawaban": { "tanda": "<=", "nilai": "-2" } },
    { "kode": "E3", "jawaban": { "tanda": ">=", "nilai": "2" } }
  ],
  "prompt_penjelasan": {
    "pertanyaan": "Mengapa tanda <= berubah menjadi >=?",
    "opsi": ["Karena dikurangi 5", "Karena dibagi bilangan negatif", "Karena hasilnya negatif"],
    "benar": 1
  }
}
```

Untuk soal cerita, tambahkan:

```json
{
  "jenis": "cerita",
  "teks": "Budi membawa uang Rp50.000. ...",
  "token_penting": ["50.000", "14.000", "4.000", "paling banyak"],
  "variabel": "x = banyak buku tulis",
  "opsi_model": ["14000 + 4000x <= 50000", "14000 + 4000x >= 50000", "4000 + 14000x <= 50000"],
  "semesta": "cacah",
  "tafsiran": "Paling banyak 9 buku tulis."
}
```

## 5.7 Rencana Jumlah Soal (Versi 1)

| Level | Contoh (worked) | Soal latihan | Soal uji |
|-------|-----------------|--------------|----------|
| M0 Prasyarat | – | 8 | – |
| L1 | 2 | 10 | 2 |
| L2 | 2 | 10 | 2 |
| L3 | 4 (2 pasang) | 16 | 3 |
| L4 | 3 | 12 | 3 |
| L5 | 3 | 10 | 2 |
| **Total** | **14** | **66** | **12** |

Ditambah **generator soal acak** (L1–L4) untuk latihan tak terbatas: koefisien dan konstanta diacak dalam rentang yang menghasilkan jawaban bilangan bulat.
