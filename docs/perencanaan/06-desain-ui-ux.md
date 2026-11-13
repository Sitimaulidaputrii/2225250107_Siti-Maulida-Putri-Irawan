# 06 — Desain UI/UX

## 6.1 Prinsip Tampilan (diturunkan dari EL03 & DS03)

1. **Satu tujuan per layar.** Setiap layar hanya meminta satu hal dari siswa.
2. **Teks pendek.** Maksimal ±2–4 kalimat per segmen; maksimal 2 kalimat penjelasan per langkah.
3. **Warna = makna.** Warna hanya dipakai untuk menandai suku x, konstanta, dan pembalikan tanda.
4. **Animasi hanya untuk matematika** (pencerminan di garis bilangan, perpindahan suku), durasi ≤ 400 ms, dapat dimatikan.
5. **Siswa mengendalikan tempo** — tidak ada hitung mundur, tidak ada perpindahan otomatis.
6. **Navigasi yang konsisten** — tombol utama selalu di bawah (mudah dijangkau ibu jari).

## 6.2 Peta Situs

```
Beranda
├── Siap-Siap (M0)
├── Belajar
│   ├── M1 Mengenal Pertidaksamaan
│   ├── M2 Garis Bilangan  ── Lab Garis Bilangan (eksplorasi)
│   ├── M3 Tambah & Kurang
│   ├── M4 Kali & Bagi  ★
│   ├── M5 Bentuk Beragam
│   └── M6 Soal Cerita
│        (setiap modul: Materi → Contoh → Latihan → Cek Cepat)
├── Latihan Bebas (acak per level)
├── Progresku
├── Kartu Aturan (dapat dibuka dari semua layar via ikon "?")
└── Pengaturan (ukuran huruf, mode gelap, kurangi animasi, gabung kelas)

Dasbor Guru (rute terpisah /guru)
├── Kelas Saya
├── Detail Kelas (tabel siswa, grafik kesalahan)
└── Ekspor Data
```

## 6.3 Wireframe Layar Utama (ponsel, 360 px)

### W1 — Beranda
```
┌──────────────────────────────┐
│ TandaTepat          (?)  (⚙) │
├──────────────────────────────┤
│ Halo, Nadia 👋               │
│ Lanjutkan: M4 Kali & Bagi    │
│ ▓▓▓▓▓▓▓░░░  Level 3          │
│ [  Lanjutkan belajar  ]      │
├──────────────────────────────┤
│ ○ Siap-Siap          ✔       │
│ ○ M1 Mengenal        ✔       │
│ ○ M2 Garis Bilangan  ✔       │
│ ○ M3 Tambah & Kurang ✔       │
│ ● M4 Kali & Bagi     ◐       │
│ ○ M5 Bentuk Beragam          │
│ ○ M6 Soal Cerita             │
└──────────────────────────────┘
```

### W2 — Contoh Bertahap
```
┌──────────────────────────────┐
│ ← Contoh 1 dari 2       (?)  │
├──────────────────────────────┤
│  −3x + 5 ≤ 11                │
│  −3x ≤ 6                     │
│    └ Kurangi kedua ruas 5.   │
│      Tanda tetap.            │
│  x ≥ −2      ⟵ (oranye)      │
│    └ Dibagi −3 (negatif)     │
│      → tanda DIBALIK.        │
│                              │
│  Langkah 3 dari 5  ●●●○○     │
├──────────────────────────────┤
│ [↺ Ulangi]  [Langkah berikut →]│
└──────────────────────────────┘
```
Catatan: langkah sebelumnya tetap terlihat (tidak hilang) agar siswa tidak perlu mengingat — mengurangi beban memori kerja.

### W3 — Lab Garis Bilangan
```
┌──────────────────────────────┐
│ ← Lab Garis Bilangan         │
├──────────────────────────────┤
│   2  <  6                    │
│ ──┼──┼──●──┼──┼──●──┼──      │
│   0     2        6           │
│                              │
│ Kalikan kedua bilangan dengan│
│ [ −1 ▾ ]   [ Terapkan ]      │
│                              │
│  −6  ?  −2                   │
│ ──●──┼──┼──┼──●──┼──┼──      │
│  −6        −2     0          │
│ Pilih tanda:  [<]  [>]       │
└──────────────────────────────┘
```

### W4 — Latihan (mode langkah)
```
┌──────────────────────────────┐
│ ← Level 3 · Soal 2      (?)  │
├──────────────────────────────┤
│  7 − x < 10                  │
│                              │
│ Langkah berikutnya:          │
│ ( ) Kurangi kedua ruas 7     │
│ ( ) Tambah kedua ruas x      │
│ ( ) Kalikan kedua ruas −1    │
│                              │
│ Hasil:  [ −x ] [<] [ 3 ]     │
├──────────────────────────────┤
│ [💡 Petunjuk] [📖 Contoh serupa]│
│ [         Periksa          ] │
└──────────────────────────────┘
```

### W5 — Input Jawaban Akhir
```
│ Jawaban:   x  [ ≥ ]  [ −2 ]  │
│ ┌────┬────┬────┬────┐        │
│ │ <  │ >  │ ≤  │ ≥  │        │
│ ├────┼────┼────┼────┤        │
│ │ 7  │ 8  │ 9  │ ⌫  │        │
│ │ 4  │ 5  │ 6  │ −  │        │
│ │ 1  │ 2  │ 3  │ /  │        │
│ │    │ 0  │ ,  │ OK │        │
│ └────┴────┴────┴────┘        │
```

### W6 — Umpan Balik
```
┌──────────────────────────────┐
│ Hampir! 🙂                   │
│ Hitunganmu benar (−2), tapi  │
│ kamu membagi dengan −3.      │
│ Apa yang terjadi pada tanda? │
│ [ Coba lagi ] [ Lihat langkah]│
└──────────────────────────────┘
```
Nada umpan balik: positif, spesifik, tanpa kata "SALAH" berukuran besar, tanpa suara dengung.

### W7 — Soal Cerita
```
┌──────────────────────────────┐
│ ← Soal Cerita 1   [🖍 Tandai] │
├──────────────────────────────┤
│ Budi membawa uang [Rp50.000].│
│ Ia membeli kotak pensil      │
│ [Rp14.000] dan beberapa buku │
│ tulis [Rp4.000] per buah.    │
│ Berapa [paling banyak] buku… │
├──────────────────────────────┤
│ ① Tandai  ② Diketahui  ③ Model│
│ ④ Selesaikan  ⑤ Tafsirkan    │
│ [       Lanjut ke ②       ]  │
└──────────────────────────────┘
```

### W8 — Prompt Penjelasan Diri
```
│ Mengapa ≤ berubah menjadi ≥? │
│ ( ) Karena dikurangi 5       │
│ ( ) Karena dibagi bil. negatif│
│ ( ) Karena hasilnya negatif  │
```

### W9 — Dasbor Guru (desktop)
```
┌───────────────────────────────────────────────────────────┐
│ Kelas IX-A  · Kode: K7Q2PX            [Ekspor CSV]         │
├──────────┬────────┬──────────┬──────────┬─────────────────┤
│ Siswa    │ Level  │ Akurasi  │ Petunjuk │ Kesalahan utama │
├──────────┼────────┼──────────┼──────────┼─────────────────┤
│ Nadia    │ L3     │ 72%      │ 9        │ E1 Lupa balik   │
│ Raka     │ L5     │ 91%      │ 2        │ E7 Model cerita │
├──────────┴────────┴──────────┴──────────┴─────────────────┤
│ Distribusi kesalahan kelas:  E1 ████████  E3 ████  E5 ██   │
└───────────────────────────────────────────────────────────┘
```

## 6.4 Panduan Gaya Visual

| Elemen | Ketentuan |
|--------|-----------|
| Huruf antarmuka | Sans-serif sistem (mis. `system-ui`, Roboto/Inter) 16 px dasar, ≥ 20 px untuk baris aljabar |
| Huruf matematika | Tampilkan dengan KaTeX (ringan, dapat *offline*) atau HTML + Unicode untuk ekspresi sederhana |
| Warna dasar | Latar putih/abu sangat muda; teks abu gelap `#1F2937` |
| Warna primer (tombol) | Biru tua `#1D4ED8` |
| Suku x | Biru `#2563EB` |
| Konstanta | Abu `#4B5563` |
| **Tanda dibalik** | Oranye `#C2410C` + ikon ⇄ (tidak hanya warna, demi siswa buta warna) |
| Benar / Perlu dicek | Hijau `#15803D` / Kuning tua `#A16207` (hindari merah besar) |
| Stabilo | Kuning `#FDE68A` |
| Ikon | Garis sederhana, satu set (mis. Lucide), tanpa ilustrasi dekoratif |
| Jarak | Kelipatan 8 px; ruang kosong cukup antar baris aljabar |

Mode gelap memakai palet yang sama dengan kecerahan disesuaikan; kontras tetap ≥ 4.5:1.

## 6.5 Aksesibilitas

- Target sentuh ≥ 44×44 px; tombol utama selebar layar.
- Semua informasi warna juga dinyatakan dengan ikon/teks.
- Dukungan pembaca layar: `aria-label` pada ekspresi matematika (mis. "minus tiga x kurang dari atau sama dengan enam").
- Opsi **Kurangi animasi** mengikuti `prefers-reduced-motion`.
- Pengaturan ukuran huruf: normal / besar / sangat besar.

## 6.6 Rencana Uji Kegunaan Prototipe

- Prototipe kertas/Figma diuji pada 3–5 siswa dengan metode *think-aloud* sebelum pengodean penuh.
- Tugas uji: menemukan contoh M4, menyelesaikan 1 soal L3, menandai soal cerita, membuka kartu aturan.
- Catat: waktu, kesalahan navigasi, ekspresi bingung, komentar "terlalu ramai".
