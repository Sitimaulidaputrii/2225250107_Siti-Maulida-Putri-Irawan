# Kuesioner Beban Kognitif

Dua instrumen ini **sudah tersedia di dalam aplikasi**. Instrumen akan muncul bila guru mengaktifkan *Instrumen beban kognitif* di Dasbor Guru → Pengaturan kelas. Versi kertas di bawah dapat dipakai sebagai cadangan. Rumusannya sama persis dengan versi di aplikasi ([skalaBeban.js](../../frontend/src/components/skalaBeban.js)).

## 1. Skala Usaha Mental (Paas, 1992)

**Kapan:** setelah setiap set latihan dan kuis (di aplikasi: setelah bagian *Latihan* atau *Cek Cepat* selesai).

> Seberapa besar usaha berpikir yang kamu keluarkan pada kegiatan tadi?

| 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|---|---|---|---|---|---|---|---|---|
| Sangat sangat ringan | Sangat ringan | Ringan | Agak ringan | Sedang | Agak berat | Berat | Sangat berat | Sangat sangat berat |

## 2. Kuesioner Beban Kognitif (adaptasi Leppink dkk., 2013)

**Kapan:** di akhir modul M4 (Kali & Bagi) dan di akhir M6 (akhir pembelajaran).
**Skala:** 0 = sama sekali tidak setuju … 10 = sangat setuju.

| Kode | Pernyataan | Jenis |
|------|-----------|-------|
| IL1 | Materi yang dibahas pada kegiatan ini sangat rumit. | Intrinsik |
| IL2 | Aturan dan rumus yang dibahas pada kegiatan ini sangat rumit. | Intrinsik |
| IL3 | Konsep dan istilah yang dibahas pada kegiatan ini sangat rumit. | Intrinsik |
| EL1 | Penjelasan dan petunjuk pada kegiatan ini sangat tidak jelas. | Ekstrinsik |
| EL2 | Penjelasan dan petunjuk pada kegiatan ini tidak membantu saya belajar. | Ekstrinsik |
| EL3 | Penjelasan dan petunjuk pada kegiatan ini memakai kata-kata yang sulit dipahami. | Ekstrinsik |
| GL1 | Kegiatan ini benar-benar menambah pemahaman saya tentang materi. | Germane |
| GL2 | Kegiatan ini benar-benar menambah pemahaman saya tentang aturan dan rumus. | Germane |
| GL3 | Kegiatan ini benar-benar menambah pemahaman saya tentang konsep dan istilah. | Germane |
| GL4 | Kegiatan ini benar-benar menambah pengetahuan dan pemahaman saya. | Germane |

**Penskoran:** rata-rata butir IL, EL, dan GL masing-masing (0–10). Harapan desain (dokumen 09 §9.4): EL rendah, GL relatif tinggi, dan IL terkelola.

## Prosedur Adaptasi (wajib sebelum pengambilan data)

Rumusan di atas adalah **terjemahan dan penyederhanaan oleh peneliti** dari instrumen berbahasa Inggris, sehingga perlu diadaptasi dengan benar:

1. **Terjemah maju–balik:** minta penerjemah lain menerjemahkan balik ke bahasa Inggris, lalu bandingkan dengan butir asli.
2. **Telaah ahli:** ahli pembelajaran/psikologi pendidikan menilai kesetaraan makna dan kesesuaian untuk siswa SMP.
3. **Uji keterbacaan:** 3–5 siswa membaca butir dan menjelaskan maknanya dengan kata-kata sendiri (*cognitive interview*).
4. Bila ada butir yang diubah, **ubah juga di aplikasi** (`BUTIR_LEPPINK` di `frontend/src/components/skalaBeban.js`) agar versi kertas dan aplikasi tetap sama.
5. Laporkan reliabilitas (alfa Cronbach) per subskala setelah data terkumpul.

## Referensi

- Leppink, J., Paas, F., van der Vleuten, C. P. M., van Gog, T., & van Merriënboer, J. J. G. (2013). Development of an instrument for measuring different types of cognitive load. *Behavior Research Methods, 45*(4), 1058–1072.
- Paas, F. (1992). Training strategies for attaining transfer of problem-solving skill in statistics: A cognitive-load approach. *Journal of Educational Psychology, 84*(4), 429–434.
- Paas, F., & van Merriënboer, J. J. G. (1993). The efficiency of instructional conditions: An approach to combine mental effort and performance measures. *Human Factors, 35*(4), 737–743.
