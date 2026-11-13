# 01 — Analisis Kebutuhan

## 1.1 Sumber Data

| Aspek | Keterangan |
|-------|-----------|
| Responden | S01, siswa kelas IX SMP |
| Tanggal | 7 November 2026 |
| Durasi | 25 menit, direkam dengan persetujuan siswa dan orang tua |
| Pewawancara | Siti Maulida Putri Irawan |
| Materi | Pertidaksamaan Linear Satu Variabel (PtLSV), dipelajari pertama kali di kelas VIII |
| Artefak pemicu | Contoh soal PtLSV (mis. `2x + 3 > 9`), buku paket, catatan siswa |
| Kategori kode | K (konteks), IL (intrinsik), EL (ekstrinsik), GL (germane), DS (kebutuhan desain) |

## 1.2 Sintesis Temuan per Kategori

### A. Konteks belajar (K01–K03)
- Pembelajaran sebelumnya **berpusat pada guru**: penjelasan di papan tulis → mencatat → latihan (K02).
- Siswa **sudah menguasai prosedur dasar** pada soal berkoefisien positif (`2x + 3 > 9`: pindahkan 3, bagi 2) (K03).
- Keraguan muncul pada **perubahan tanda saat dikali/dibagi bilangan negatif** (K03).

### B. Beban intrinsik — apa yang memang sulit dari materinya (IL01–IL05)
| Kode | Temuan | Implikasi |
|------|--------|-----------|
| IL01, IL02 | Aturan **membalik tanda** saat kedua ruas dikali/dibagi bilangan negatif adalah bagian paling sulit dan sering tertukar | Aturan ini menjadi **konsep inti** yang perlu dibangun dengan pemahaman, bukan hafalan; diberi porsi latihan terbesar |
| IL03 | Prasyarat: operasi hitung (terutama bilangan bulat) dan PLSV | Perlu **cek prasyarat + pelatihan awal** (*pre-training*) |
| IL04 | Kesulitan naik ketika ada **bilangan negatif** dan **soal cerita** | Kedua unsur ini dijadikan **level tersendiri**, tidak dicampur di awal |
| IL05 | Sumber kesalahan: (a) aturan/langkah, (b) salah hitung, terutama bilangan negatif | Umpan balik harus **membedakan jenis kesalahan** |

### C. Beban ekstrinsik — apa yang membebani karena penyajian (EL01–EL05)
| Kode | Temuan | Implikasi |
|------|--------|-----------|
| EL01 | Bingung bila **bentuk soal berbeda dari contoh guru**: tidak tahu mulai dari mana | Sediakan **variasi bentuk** secara bertahap + petunjuk "langkah pertama" |
| EL02 | **Garis bilangan, tabel, contoh langkah demi langkah** membantu | Garis bilangan dan contoh bertahap menjadi fitur utama |
| EL03 | Warna & gambar membantu **secukupnya**; berlebihan mengganggu | Desain minimalis, warna hanya untuk penanda makna |
| EL04 | Tertinggal bila **langkah terlalu banyak**; aturan tanda perlu diulang | Satu langkah per layar/ketukan, dapat diulang kapan saja |
| EL05 | Soal cerita panjang menyulitkan menemukan informasi penting; siswa menandai angka & pertanyaan | Alat **stabilo/penanda** pada soal cerita + tabel "Diketahui–Ditanya" |

### D. Beban germane — apa yang membantu membangun pemahaman (GL01–GL05)
| Kode | Temuan | Implikasi |
|------|--------|-----------|
| GL01 | Contoh dulu, lalu mencoba sendiri | Pola **contoh → contoh berpasangan → latihan** |
| GL02* | Mengerjakan soal lain untuk mengecek pemahaman | Latihan tambahan tak terbatas (soal acak/variasi) |
| GL03 | Melihat kembali contoh; berdiskusi dengan teman | Tombol **"Lihat contoh serupa"** saat latihan |
| GL04 | Menjelaskan langkah kepada teman/diri sendiri | **Prompt penjelasan diri** (*self-explanation*) |
| GL05 | Latihan dari mudah ke sulit membantu | **Latihan berjenjang** dengan syarat naik level |

\* Pada laporan wawancara, kolom kode GL02 masih kosong; berdasarkan isinya dikodekan sebagai GL.

### E. Kebutuhan desain langsung dari siswa (DS01–DS03)
- **DS01:** penjelasan materi, contoh soal, dan langkah penyelesaian.
- **DS02:** penentuan tanda & langkah penyelesaian dijelaskan **perlahan**; latihan bisa dicoba sendiri.
- **DS03:** **tidak terlalu banyak tulisan atau animasi**, gambar secukupnya, penjelasan singkat, ada latihan yang dapat dikerjakan.

## 1.3 Rumusan Masalah Desain

> Bagaimana merancang aplikasi PtLSV yang **mengelola beban intrinsik** aturan pembalikan tanda melalui urutan bertahap, **mengurangi beban ekstrinsik** dari tampilan dan langkah yang padat, serta **mendorong beban germane** melalui contoh bertahap, latihan berjenjang, dan penjelasan diri?

## 1.4 Persona Siswa

**Nama persona:** Nadia, 14 tahun, kelas IX
- Memakai ponsel Android kelas menengah, kuota internet terbatas, kadang sinyal lemah.
- Paham langkah dasar PtLSV koefisien positif; sering lupa membalik tanda.
- Mudah kewalahan oleh layar yang ramai atau penjelasan panjang.
- Suka mencoba soal sendiri setelah melihat contoh; terbiasa menandai angka di soal cerita.
- **Tujuan:** bisa mengerjakan soal PtLSV termasuk soal cerita tanpa salah tanda.
- **Frustrasi:** "Saya tidak tahu harus mulai dari mana kalau bentuk soalnya beda."

**Persona sekunder — Guru:** ingin melihat siswa mana yang masih sering salah tanda, tanpa repot menyiapkan akun rumit.

## 1.5 Kebutuhan Teknis yang Disimpulkan

| Kebutuhan | Alasan |
|-----------|--------|
| Dapat dibuka di browser dan diinstal tanpa toko aplikasi | Permintaan pengembang; memudahkan distribusi di sekolah |
| Ringan dan dapat berjalan *offline* | Kuota & sinyal siswa terbatas |
| Tampilan ponsel sebagai prioritas (*mobile-first*) | Perangkat utama siswa |
| Tanpa data pribadi sensitif | Pengguna anak di bawah umur |

## 1.6 Keterbatasan Analisis & Rekomendasi Tambahan

1. **Responden baru satu orang (S01).** Temuan perlu diperkuat. Disarankan menambah 3–5 siswa dengan kemampuan berbeda (tinggi, sedang, rendah) dan **1 guru matematika**.
2. **Tes diagnostik singkat** (5–8 soal) untuk memastikan pola kesalahan nyata, bukan hanya persepsi siswa — mis. apakah siswa membalik tanda saat *memindahkan ruas* (miskonsepsi lain yang umum).
3. **Analisis dokumen**: buku paket dan ATP sekolah untuk memastikan kelas/urutan materi (siswa menyebut kelas VIII, sedangkan pada beberapa buku Kurikulum Merdeka materi ini berada di kelas VII).
4. Kategori kode di header laporan tertulis `IL/EL/GL/K`, padahal laporan juga memakai **DS**; sebaiknya ditambahkan pada keterangan kode.
