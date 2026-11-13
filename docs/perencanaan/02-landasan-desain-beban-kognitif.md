# 02 — Landasan Desain Berbasis Beban Kognitif

## 2.1 Kerangka Singkat

Teori Beban Kognitif (Sweller, 1988; Sweller, van Merriënboer & Paas, 1998, 2019) menyatakan bahwa memori kerja terbatas. Desain pembelajaran yang baik:
1. **Mengelola** beban intrinsik (IL) — memecah dan mengurutkan materi kompleks.
2. **Mengurangi** beban ekstrinsik (EL) — menghilangkan hal yang tidak membantu belajar.
3. **Mengoptimalkan** beban germane (GL) — mengarahkan sumber daya mental ke pembentukan skema.

Prinsip multimedia Mayer (2009, 2021) dipakai sebagai turunan praktis untuk tampilan layar.

## 2.2 Matriks Keterlacakan: Temuan → Prinsip → Keputusan Desain

| ID Desain | Temuan wawancara | Prinsip | Keputusan desain dalam aplikasi |
|-----------|------------------|---------|----------------------------------|
| D01 | IL03 (prasyarat bilangan bulat, PLSV) | *Pre-training* (Mayer) | Modul **"Siap-Siap"**: 6–8 soal cepat operasi bilangan negatif & PLSV; jika belum lulus, diberi kartu ringkas sebelum masuk materi |
| D02 | IL01, IL02, K03 (aturan balik tanda) | Mengurutkan dari sederhana ke kompleks; *isolated-interacting elements* | Aturan balik tanda diajarkan **terpisah dulu** (tanpa pindah ruas) melalui eksplorasi angka: `3 < 5` → kali −1 → `−3 ? −5` |
| D03 | IL01 | Pemahaman konseptual mengurangi beban hafalan | **Eksplorasi garis bilangan**: titik dicerminkan saat dikali −1 sehingga urutan terbalik — siswa *melihat* mengapa tanda dibalik |
| D04 | EL04, DS02 | *Segmenting* (Mayer) | Contoh soal dibuka **satu langkah per ketukan** ("Langkah berikutnya"), dengan tombol "Ulangi langkah ini" |
| D05 | GL01, EL02 | *Worked-example effect* | Setiap topik dimulai dengan contoh lengkap sebelum latihan |
| D06 | GL01, GL05 | *Completion problem / fading* (Renkl & Atkinson) | Urutan: contoh lengkap → contoh dengan 1 langkah kosong → 2 langkah kosong → mandiri |
| D07 | EL01 | *Variability of practice*; pasangan contoh | **Contoh berpasangan** (positif vs negatif; bentuk berbeda) ditampilkan berdampingan agar siswa melihat struktur yang sama |
| D08 | EL01 | Strategi heuristik | Tombol **"Mulai dari mana?"** menampilkan pertanyaan pemandu: "Kumpulkan suku x di ruas mana?" |
| D09 | EL03, DS03 | *Coherence* (hapus hal tak relevan) | Tanpa maskot bergerak, tanpa latar bergambar, tanpa musik; animasi hanya untuk proses matematis |
| D10 | EL03 | *Signaling* | Warna dipakai **hanya** untuk makna: oranye = tanda dibalik, biru = suku x, abu-abu = konstanta |
| D11 | EL02 | *Spatial contiguity* (hindari *split-attention*) | Penjelasan langkah ditempel **tepat di samping/bawah** baris aljabar yang dijelaskan, bukan di kotak terpisah |
| D12 | DS03 | *Redundancy* | Tidak menampilkan teks panjang yang sama dengan narasi; penjelasan maksimal ±2 kalimat per langkah |
| D13 | EL05 | Mengurangi pencarian informasi | Soal cerita dilengkapi **alat stabilo** (ketuk kata/angka untuk menandai) dan tabel **Diketahui – Ditanya – Model** |
| D14 | EL05, IL04 | Memecah soal cerita | Soal cerita dikerjakan dalam 3 tahap: (1) tandai informasi, (2) susun model pertidaksamaan (pilihan), (3) selesaikan |
| D15 | GL04 | *Self-explanation effect* (Chi) | Setelah langkah kunci, muncul prompt pilihan ganda singkat: "Mengapa tandanya dibalik?" |
| D16 | IL05 | Umpan balik elaboratif (Shute, 2008) | Umpan balik **mendiagnosis jenis kesalahan** (lupa balik tanda, salah hitung, salah bulatan garis bilangan) dan memberi petunjuk spesifik, bukan sekadar "Salah" |
| D17 | GL02, GL05 | Latihan berjenjang & *mastery* | 5 level; naik level setelah 3 benar berturut-turut tanpa petunjuk |
| D18 | GL03 | Akses contoh saat latihan | Tombol **"Lihat contoh serupa"** (dicatat sebagai penggunaan bantuan) |
| D19 | EL04 | Kendali tempo oleh siswa (*learner pacing*) | Tidak ada pengatur waktu / hitung mundur; siswa menentukan kecepatan sendiri |
| D20 | EL01 (beban mengetik) | Mengurangi beban antarmuka | Jawaban akhir dimasukkan dengan **tombol tanda (<, >, ≤, ≥) + papan angka**, bukan mengetik bebas |
| D21 | Semua | *Expertise reversal effect* | Bantuan berkurang otomatis bila siswa makin mahir; siswa mahir dapat melewati contoh |

## 2.3 Hal yang Sengaja **Tidak** Dimasukkan

| Fitur | Alasan ditiadakan |
|-------|-------------------|
| Animasi dekoratif, maskot, efek konfeti panjang | EL03, DS03 — mengganggu fokus |
| Video penjelasan panjang | EL04 — sulit diikuti bila langkah banyak; diganti langkah yang dikendalikan siswa |
| Papan peringkat (*leaderboard*) | Dapat menambah kecemasan; tidak ada dasar dari wawancara |
| Batas waktu per soal | Menambah beban; bertentangan dengan DS02 ("lebih perlahan") |
| Materi di luar PtLSV pada versi 1 | Menjaga fokus dan cakupan proyek |

## 2.4 Referensi Utama (untuk Bab Kajian Teori)

- Chi, M. T. H., et al. (1989). Self-explanations: How students study and use examples in learning to solve problems. *Cognitive Science, 13*(2), 145–182.
- Leppink, J., Paas, F., van der Vleuten, C. P. M., van Gog, T., & van Merriënboer, J. J. G. (2013). Development of an instrument for measuring different types of cognitive load. *Behavior Research Methods, 45*(4), 1058–1072.
- Mayer, R. E. (2021). *Multimedia Learning* (3rd ed.). Cambridge University Press.
- Paas, F. (1992). Training strategies for attaining transfer of problem-solving skill in statistics: A cognitive-load approach. *Journal of Educational Psychology, 84*(4), 429–434.
- Renkl, A., & Atkinson, R. K. (2003). Structuring the transition from example study to problem solving in cognitive skill acquisition. *Educational Psychologist, 38*(1), 15–22.
- Shute, V. J. (2008). Focus on formative feedback. *Review of Educational Research, 78*(1), 153–189.
- Sweller, J. (1988). Cognitive load during problem solving: Effects on learning. *Cognitive Science, 12*(2), 257–285.
- Sweller, J., van Merriënboer, J. J. G., & Paas, F. (2019). Cognitive architecture and instructional design: 20 years later. *Educational Psychology Review, 31*(2), 261–292.

> Periksa kembali detail bibliografi (volume, halaman) pada sumber aslinya sebelum dimasukkan ke laporan/skripsi.
