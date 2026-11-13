# 03 — Spesifikasi Kebutuhan Perangkat Lunak

## 3.1 Ruang Lingkup Versi 1 (MVP)

- Materi: **hanya PtLSV** (beserta prasyarat singkat).
- Pengguna: **siswa** (utama), **guru** (dasbor sederhana).
- Platform: PWA — browser modern di Android, iOS, dan desktop; dapat diinstal dan berjalan *offline*.

## 3.2 Aktor

| Aktor | Deskripsi |
|-------|-----------|
| Siswa | Belajar materi, mengerjakan contoh & latihan, melihat progres |
| Guru | Membuat kode kelas, melihat ringkasan progres & kesalahan umum kelas |
| Admin/Pengembang | Mengelola konten dan bank soal (melalui file JSON + alat Python) |

## 3.3 User Story

| ID | Sebagai… | Saya ingin… | Agar… | Prioritas |
|----|----------|-------------|-------|-----------|
| US01 | siswa | mulai belajar tanpa mendaftar dengan email | cepat dan data pribadi aman | Must |
| US02 | siswa | mengecek apakah prasyarat saya sudah cukup | tidak tersendat saat belajar inti | Must |
| US03 | siswa | membaca materi dalam potongan pendek | tidak kewalahan | Must |
| US04 | siswa | membuka contoh satu langkah per ketukan dan mengulang langkah | bisa mengikuti dengan tempo sendiri | Must |
| US05 | siswa | bereksperimen dengan garis bilangan | memahami mengapa tanda dibalik | Must |
| US06 | siswa | mengerjakan latihan dari mudah ke sulit | memahami dasar dulu | Must |
| US07 | siswa | mendapat petunjuk spesifik saat salah | tahu letak kesalahan saya | Must |
| US08 | siswa | menandai angka dan pertanyaan di soal cerita | mudah menemukan informasi penting | Must |
| US09 | siswa | melihat contoh serupa saat latihan | punya pegangan ketika bingung | Must |
| US10 | siswa | tetap bisa belajar tanpa internet | hemat kuota | Must |
| US11 | siswa | menginstal aplikasi dari browser | membukanya seperti aplikasi biasa | Must |
| US12 | siswa | melihat progres saya | tahu bagian yang sudah dikuasai | Should |
| US13 | siswa | menjelaskan alasan langkah (pilihan singkat) | memperkuat pemahaman | Should |
| US14 | siswa | membuka kartu ringkas aturan tanda kapan saja | mengingat aturan | Should |
| US15 | guru | membuat kode kelas | siswa bisa bergabung | Should |
| US16 | guru | melihat siswa yang sering lupa membalik tanda | memberi bantuan tepat | Should |
| US17 | siswa | mengatur ukuran huruf & mode gelap | nyaman membaca | Could |
| US18 | siswa | mengisi skala usaha mental singkat setelah latihan | (untuk penelitian) mengukur beban kognitif | Should |
| US19 | guru | mengunduh data progres (CSV) | analisis penelitian | Could |
| US20 | siswa | latihan soal acak tak terbatas | menguji pemahaman | Could |

## 3.4 Kebutuhan Fungsional

### F1 — Akun & Sesi
- F1.1 Siswa masuk dengan **nama panggilan + PIN 4 digit**; kode kelas opsional.
- F1.2 Tanpa kode kelas, aplikasi tetap berfungsi penuh secara lokal (mode tamu).
- F1.3 Guru masuk dengan email + kata sandi (guru adalah orang dewasa).
- F1.4 Data lokal tersinkron ke server saat daring bila siswa tergabung ke kelas.

### F2 — Modul Siap-Siap (Prasyarat)
- F2.1 Kuis 6–8 soal: penjumlahan/pengurangan/perkalian/pembagian bilangan bulat negatif dan PLSV sederhana.
- F2.2 Skor ≥ 75% → lanjut; < 75% → tampil kartu ringkas + soal ulang yang lebih sedikit.
- F2.3 Siswa boleh melewati, tetapi ditandai pada progres.

### F3 — Materi
- F3.1 Materi dibagi menjadi segmen pendek (≤ 1 layar ponsel, ± 2–4 kalimat + 1 visual).
- F3.2 Navigasi maju/mundur, indikator posisi (mis. 3/7).
- F3.3 Kartu **Aturan Tanda** dapat dibuka dari mana saja.

### F4 — Eksplorasi Garis Bilangan
- F4.1 Siswa memilih dua bilangan, mengalikan/membagi dengan bilangan positif atau negatif, dan melihat posisi baru keduanya serta tanda pertidaksamaan yang benar.
- F4.2 Menampilkan himpunan penyelesaian pada garis bilangan (bulatan terbuka untuk `<`/`>`, tertutup untuk `≤`/`≥`).
- F4.3 Mode latihan: siswa sendiri menempatkan bulatan dan arah arsiran.

### F5 — Contoh Bertahap
- F5.1 Setiap langkah dibuka lewat tombol "Langkah berikutnya".
- F5.2 Setiap langkah memuat: baris aljabar, alasan singkat (≤ 2 kalimat), penyorotan warna sesuai makna.
- F5.3 Tombol "Ulangi langkah ini" dan "Kembali".
- F5.4 Contoh berpasangan ditampilkan berdampingan (desktop) atau dapat digeser (ponsel).

### F6 — Latihan Berjenjang
- F6.1 Lima level (lihat dokumen 04 & 05).
- F6.2 Mode bantuan memudar: (a) lengkapi 1 langkah, (b) lengkapi beberapa langkah, (c) mandiri.
- F6.3 Input jawaban akhir: tombol `x`, tombol tanda `< > ≤ ≥`, papan angka (termasuk tanda negatif dan pecahan).
- F6.4 Mode langkah: siswa memilih operasi berikutnya dari opsi (mis. "kurangi kedua ruas dengan 5", "bagi kedua ruas dengan −3") lalu mengisi hasil.
- F6.5 Petunjuk bertingkat (3 tingkat): pertanyaan pemandu → langkah kunci → contoh serupa.
- F6.6 Naik level setelah 3 benar berturut-turut tanpa petunjuk; boleh mengulang level.

### F7 — Umpan Balik Diagnostik
- F7.1 Sistem mengenali minimal jenis kesalahan berikut:
  | Kode | Kesalahan |
  |------|-----------|
  | E1 | Lupa membalik tanda saat membagi/mengalikan dengan negatif |
  | E2 | Membalik tanda padahal tidak perlu (mis. saat memindahkan suku atau membagi bilangan positif) |
  | E3 | Salah hitung operasi bilangan bulat |
  | E4 | Salah tanda saat memindahkan suku ke ruas lain |
  | E5 | Salah bulatan pada garis bilangan (terbuka/tertutup) |
  | E6 | Salah arah arsiran pada garis bilangan |
  | E7 | Salah memodelkan kalimat soal cerita (mis. "paling sedikit" → `≥`) |
  | E8 | Tidak memperhatikan semesta pembicaraan (mis. jawaban harus bilangan cacah) |
- F7.2 Pesan umpan balik singkat, spesifik, tidak menyalahkan; disertai tautan ke langkah/contoh terkait.

### F8 — Soal Cerita
- F8.1 Alat stabilo: ketuk kata/angka untuk menandai (warna kuning) — dapat dihapus.
- F8.2 Tabel isian **Diketahui – Ditanya – Misalkan x = …**.
- F8.3 Menyusun model: pilih dari 3–4 opsi model pertidaksamaan, lalu selesaikan.
- F8.4 Langkah terakhir: menafsirkan jawaban dalam konteks soal.

### F9 — Penjelasan Diri
- F9.1 Setelah langkah kunci, muncul prompt pilihan ganda (mis. "Mengapa tanda berubah dari `>` menjadi `<`?").
- F9.2 Dapat dinonaktifkan oleh peneliti/guru melalui pengaturan kelas (untuk desain eksperimen).

### F10 — Progres
- F10.1 Peta progres per modul & level (selesai/sedang/terkunci-lunak).
- F10.2 Ringkasan kesalahan yang paling sering dibuat siswa, dengan tautan latihan penguatan.

### F11 — Dasbor Guru
- F11.1 Membuat kelas & kode kelas.
- F11.2 Tabel siswa: level tercapai, akurasi, jumlah petunjuk, kesalahan dominan.
- F11.3 Grafik distribusi jenis kesalahan di kelas.
- F11.4 Ekspor CSV (data anonim).

### F12 — Instrumen Penelitian (Opsional, dapat diaktifkan)
- F12.1 Skala usaha mental 1–9 (Paas) setelah setiap set latihan.
- F12.2 Kuesioner beban kognitif (IL/EL/GL) di akhir modul.
- F12.3 Pretest & posttest dengan paket soal paralel.

## 3.5 Kebutuhan Non-Fungsional

| ID | Kategori | Kebutuhan |
|----|----------|-----------|
| NF1 | Kinerja | Muat pertama < 3 detik pada 4G; muat berikutnya < 1 detik (dari *cache*) |
| NF2 | Ukuran | Unduhan awal aplikasi ≤ 2 MB (tanpa video) |
| NF3 | Offline | Semua materi, contoh, latihan, dan progres lokal berfungsi tanpa internet |
| NF4 | Kompatibilitas | Chrome Android ≥ 100, Safari iOS ≥ 16.4, Chrome/Edge/Firefox desktop terbaru |
| NF5 | Responsif | Lebar layar 320 px – 1440 px |
| NF6 | Aksesibilitas | Kontras teks ≥ 4.5:1, target sentuh ≥ 44×44 px, mendukung pembesaran huruf, opsi kurangi animasi |
| NF7 | Privasi | Tidak menyimpan nama lengkap, email, foto, atau lokasi siswa; data dalam bentuk pseudonim |
| NF8 | Keamanan | HTTPS wajib; PIN & kata sandi di-*hash* (bcrypt/argon2); token JWT berumur pendek |
| NF9 | Keterpeliharaan | Konten (materi & soal) di file JSON terpisah dari kode; tervalidasi otomatis oleh skrip Python |
| NF10 | Bahasa | Bahasa Indonesia baku, kalimat pendek, sesuai tingkat SMP |
| NF11 | Instalasi | Dapat diinstal langsung dari browser (PWA); opsional APK *sideload* |
