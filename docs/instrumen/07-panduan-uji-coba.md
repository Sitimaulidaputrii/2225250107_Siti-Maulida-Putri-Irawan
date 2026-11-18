# Panduan Pelaksanaan Uji Coba

## 1. Persiapan (sebelum minggu 12)

- [ ] Aplikasi sudah di-*deploy* dengan HTTPS (lihat [panduan deployment](../perencanaan/10-instalasi-dan-deployment.md)); `SECRET_KEY` sudah diganti.
- [ ] Surat izin dari program studi dan sekolah.
- [ ] Persetujuan orang tua dan persetujuan siswa (format di §6).
- [ ] Peneliti/guru membuat akun di **Dasbor Guru** (Beranda → *Untuk guru*) dan membuat kelas, mis. "IX-A uji lapangan".
- [ ] Di *Pengaturan kelas*: aktifkan **Instrumen beban kognitif** dan biarkan **Prompt penjelasan diri** aktif.
- [ ] Cetak lembar panduan instal + kode QR alamat aplikasi + **kode kelas**.
- [ ] Coba seluruh alur di 2 HP Android berbeda, termasuk mode pesawat.

## 2. Tahap Uji Coba

| Tahap | Minggu | Peserta | Kegiatan | Data |
|-------|--------|---------|----------|------|
| Validasi ahli | 12 | 2–4 validator | Mengisi lembar 01 & 02 | Skor + saran → Aiken's V |
| Uji perorangan | 13 | 3 siswa (tinggi/sedang/rendah) | Memakai aplikasi sambil berpikir keras (*think-aloud*); peneliti mencatat kebingungan | Catatan observasi → revisi I |
| Uji kelompok kecil | 14 | 6–10 siswa | Memakai M0–M6 secara mandiri, lalu mengisi angket 03 | Angket + SUS → revisi II |
| Uji lapangan terbatas | 15 | 1 kelas | Skenario 4 pertemuan (§3) | Pretest/posttest, beban kognitif, log aplikasi, wawancara |

## 3. Skenario Uji Lapangan (4 pertemuan × 2 JP)

| Pertemuan | Kegiatan | Waktu |
|-----------|----------|-------|
| 1 | Pengantar & persetujuan · **Pretest paket A** (40 menit) · instal aplikasi · gabung kelas (Pengaturan → Kelas) · M0 Siap-Siap · M1 | 80 menit |
| 2 | M2 Garis Bilangan · M3 Tambah & Kurang | 80 menit |
| 3 | M4 Kali & Bagi (termasuk Lab Garis Bilangan) — kuesioner beban kognitif muncul otomatis di akhir M4 | 80 menit |
| 4 | M5 Bentuk Beragam · M6 Soal Cerita · **Posttest paket B** · angket 03 | 80 menit |
| Sesudahnya | Wawancara pasca-uji 3–5 siswa (instrumen 06) | 20 menit/siswa |

**Peran guru/peneliti selama pembelajaran:** memfasilitasi, bukan menjelaskan ulang materi, agar dampak aplikasi dapat diukur. Catat bantuan yang diberikan di lembar observasi sederhana (siapa, kapan, tentang apa).

## 4. Pengumpulan Data dari Aplikasi

1. Pastikan siswa menekan **Pengaturan → Kirim sekarang** di akhir setiap pertemuan, atau cukup buka aplikasi saat ada internet (sinkron berjalan otomatis).
2. Di Dasbor Guru → kelas → **Ekspor data**:
   - *Jawaban siswa (CSV)*: semua jawaban, benar/salah, kode kesalahan E1–E8, penggunaan petunjuk.
   - *Beban kognitif (CSV)*: skor Paas dan Leppink.
3. Data diekspor dengan **kode pseudonim** (mis. `S7K2…`), bukan nama. Simpan daftar padanan kode ↔ kode siswa penelitian (S01, S02, …) secara terpisah dan aman.

## 5. Rencana Cadangan

| Masalah | Solusi |
|---------|--------|
| Internet sekolah lambat | Siswa menginstal di rumah sehari sebelumnya; aplikasi tetap berjalan offline |
| HP siswa tidak mendukung | Pinjamkan HP/laptop sekolah, atau siswa berpasangan (catat di observasi) |
| Siswa lupa PIN | Siswa membuat akun baru dengan nama panggilan lain; catat padanannya |
| Server mati | Data aman di HP siswa dan akan terkirim saat server aktif kembali |

## 6. Format Persetujuan

### Persetujuan Orang Tua/Wali

> Saya, ………………………… orang tua/wali dari ………………………… kelas ………, telah mendapat penjelasan tentang penelitian "Pengembangan Aplikasi Pembelajaran Pertidaksamaan Linear Satu Variabel Berbasis Teori Beban Kognitif" oleh Siti Maulida Putri Irawan. Saya memahami bahwa:
> 1. Anak saya akan memakai aplikasi, mengerjakan tes, mengisi angket, dan mungkin diwawancarai (direkam suara).
> 2. Aplikasi **tidak** mengumpulkan nama lengkap, email, nomor HP, foto, atau lokasi.
> 3. Hasil penelitian tidak memengaruhi nilai rapor anak saya.
> 4. Anak saya boleh berhenti kapan saja tanpa konsekuensi.
> 5. Data hanya dipakai untuk penelitian dan disajikan tanpa identitas.
>
> Dengan ini saya **setuju / tidak setuju** anak saya ikut serta.
> Tempat, tanggal: …………………   Tanda tangan: …………………

### Persetujuan Siswa

> Saya sudah mendengar penjelasan tentang penelitian ini. Saya tahu bahwa saya boleh berhenti kapan saja dan nilai saya tidak terpengaruh. Saya **mau / tidak mau** ikut.
> Nama panggilan: …………………   Tanda tangan: …………………
