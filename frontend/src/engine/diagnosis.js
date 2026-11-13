/**
 * Diagnosis kesalahan siswa (kode E1–E8, lihat docs/perencanaan/03 & 04).
 *
 * Prinsip umpan balik (beban kognitif): SATU pesan per jawaban, singkat, spesifik,
 * tidak menyalahkan, dan menunjuk langkah yang perlu dicek.
 */
import { Pecahan } from './pecahan.js';
import { parsePertidaksamaan } from './parser.js';
import {
  arahTanda,
  balikTanda,
  ekuivalen,
  formatHasil,
  formatTanda,
  selesaikan,
  tandaInklusif,
} from './penyelesai.js';

export const NAMA_KESALAHAN = {
  E1: 'Lupa membalik tanda',
  E2: 'Membalik tanda padahal tidak perlu',
  E3: 'Salah hitung',
  E4: 'Salah tanda saat memindahkan suku',
  E5: 'Batas termasuk/tidak termasuk tertukar',
  E6: 'Arah arsiran salah',
  E7: 'Model soal cerita kurang tepat',
  E8: 'Jawaban tidak sesuai semesta',
  LAIN: 'Kesalahan lain',
};

const TANDA_SAH = { '<': '<', '>': '>', '<=': '<=', '>=': '>=', '≤': '<=', '≥': '>=' };
const u = (s) => String(s).replace(/-/g, '−');
const tampil = (op) => formatTanda(op, { unicode: true });

function normalTanda(t) {
  const op = TANDA_SAH[t];
  if (!op) throw new TypeError(`Tanda tidak dikenali: ${t}`);
  return op;
}

const benar = (pesan = 'Tepat! 🙂') => ({ benar: true, kode: null, pesan });
const salah = (kode, pesan) => ({ benar: false, kode, nama: NAMA_KESALAHAN[kode], pesan });

/**
 * Nilai x yang dihasilkan bila siswa memindahkan suku TANPA mengganti tandanya (E4).
 * Untuk a₁x + b₁ (op) a₂x + b₂: konstanta pindah sebagai b₂ + b₁, atau suku x sebagai a₁ + a₂.
 */
function kandidatPindahRuasSalah({ kiri, kanan }) {
  const A = kiri.a.kurang(kanan.a);
  const B = kanan.b.kurang(kiri.b);
  const Asalah = kiri.a.tambah(kanan.a);
  const Bsalah = kanan.b.tambah(kiri.b);
  const hasil = [];
  for (const [pembilang, penyebut] of [[Bsalah, A], [B, Asalah], [Bsalah, Asalah]]) {
    if (!penyebut.nol()) hasil.push(pembilang.bagi(penyebut));
  }
  const nilaiBenar = A.nol() ? null : B.bagi(A);
  return hasil.filter((n) => !nilaiBenar || !n.sama(nilaiBenar));
}

/**
 * Mendiagnosis jawaban akhir aljabar, mis. siswa menjawab "x ≥ −2".
 * @param {string|object} soal  teks pertidaksamaan atau hasil parsePertidaksamaan
 * @param {{tanda: string, nilai: string|number|Pecahan}} jawabanSiswa
 * @param {{salahUmum?: Array<{kode, jawaban:{tanda, nilai}}>}} opsi  dari file bank soal
 */
export function diagnosisJawaban(soal, jawabanSiswa, { salahUmum = [] } = {}) {
  const pt = typeof soal === 'string' ? parsePertidaksamaan(soal) : soal;
  const kunci = selesaikan(pt);
  const siswa = { tanda: normalTanda(jawabanSiswa.tanda), nilai: Pecahan.dari(jawabanSiswa.nilai) };

  if (kunci.jenis !== 'batas') {
    return salah('LAIN', `Coba selesaikan lagi: suku x habis, sehingga hasilnya "${formatHasil(kunci)}".`);
  }
  if (siswa.tanda === kunci.tanda && siswa.nilai.sama(kunci.nilai)) return benar();

  // 1) Pola kesalahan yang ditulis penyusun soal didahulukan.
  const cocok = salahUmum.find(
    (s) => normalTanda(s.jawaban.tanda) === siswa.tanda && Pecahan.dari(s.jawaban.nilai).sama(siswa.nilai),
  );
  if (cocok && cocok.kode !== 'E1' && cocok.kode !== 'E2') {
    return pesanUntuk(cocok.kode, kunci, siswa);
  }

  // 2) Deteksi otomatis.
  const nilaiSama = siswa.nilai.sama(kunci.nilai);
  if (nilaiSama && siswa.tanda === balikTanda(kunci.tanda)) {
    return pesanUntuk(kunci.dibalik ? 'E1' : 'E2', kunci, siswa);
  }
  if (nilaiSama && arahTanda(siswa.tanda) === arahTanda(kunci.tanda)) {
    return pesanUntuk('E5', kunci, siswa);
  }
  if (nilaiSama) {
    return salah('LAIN', `Angka ${u(kunci.nilai)} sudah tepat. Periksa lagi arah tanda dan apakah ${u(kunci.nilai)} termasuk.`);
  }

  const arahSama = arahTanda(siswa.tanda) === arahTanda(kunci.tanda);
  const pindahSalah = kandidatPindahRuasSalah(pt).some((n) => n.sama(siswa.nilai));
  if (arahSama && siswa.nilai.sama(kunci.nilai.neg())) return pesanUntuk('E3', kunci, siswa, 'tanda-bilangan');
  if (pindahSalah) return pesanUntuk('E4', kunci, siswa);
  if (arahSama) return pesanUntuk('E3', kunci, siswa);
  if (cocok) return pesanUntuk(cocok.kode, kunci, siswa);
  return salah('LAIN', 'Belum tepat. Coba kerjakan langkah demi langkah, atau buka petunjuk.');
}

function pesanUntuk(kode, kunci, siswa, varian) {
  const nilai = u(kunci.nilai);
  switch (kode) {
    case 'E1':
      return salah('E1',
        `Hitunganmu sudah benar (${nilai}). Tapi kamu membagi atau mengalikan dengan bilangan negatif (${u(kunci.pembagi)}). Apa yang harus terjadi pada tanda?`);
    case 'E2':
      return salah('E2',
        `Kamu membagi dengan ${u(kunci.pembagi)} (positif), jadi tanda tidak perlu dibalik. Ingat: hanya kali/bagi bilangan negatif yang membalik tanda.`);
    case 'E3':
      return salah('E3', varian === 'tanda-bilangan'
        ? 'Arah tandamu sudah tepat! Periksa lagi tanda positif/negatif hasil pembagianmu.'
        : 'Arah tandamu sudah tepat! Periksa lagi hitunganmu, terutama operasi bilangan negatif.');
    case 'E4':
      return salah('E4',
        'Saat suatu suku dipindah ke ruas lain, operasinya berubah: tambah menjadi kurang, kurang menjadi tambah. Coba cek langkah memindahkan suku.');
    case 'E5':
      return salah('E5', tandaInklusif(kunci.tanda)
        ? `Tanda ${tampil(kunci.tanda)} berarti ${nilai} juga termasuk. Coba periksa tandanya lagi.`
        : `Tanda ${tampil(kunci.tanda)} berarti ${nilai} tidak termasuk. Coba periksa tandanya lagi.`);
    default:
      return salah(kode, 'Belum tepat. Coba periksa lagi langkahmu.');
  }
}

/**
 * Mendiagnosis gambar himpunan penyelesaian di garis bilangan.
 * @param {{nilai, bulatan: 'terbuka'|'tertutup', arah: 'kiri'|'kanan'}} garisSiswa
 * Hanya kesalahan pertama yang dilaporkan (titik → bulatan → arah) agar umpan balik tidak menumpuk.
 */
export function diagnosisGaris(soal, garisSiswa) {
  const kunci = selesaikan(soal);
  if (kunci.jenis !== 'batas') return salah('LAIN', `Hasilnya "${formatHasil(kunci)}".`);
  const nilai = u(kunci.nilai);
  if (!Pecahan.dari(garisSiswa.nilai).sama(kunci.nilai)) {
    return salah('E3', `Titik batasnya belum tepat. Selesaikan dulu pertidaksamaannya untuk menemukan titik batas.`);
  }
  const bulatanBenar = tandaInklusif(kunci.tanda) ? 'tertutup' : 'terbuka';
  if (garisSiswa.bulatan !== bulatanBenar) {
    return salah('E5', bulatanBenar === 'terbuka'
      ? `Tanda ${tampil(kunci.tanda)} tidak memuat ${nilai}, jadi bulatannya terbuka (○).`
      : `Tanda ${tampil(kunci.tanda)} memuat ${nilai}, jadi bulatannya tertutup (●).`);
  }
  const arahBenar = arahTanda(kunci.tanda);
  if (garisSiswa.arah !== arahBenar) {
    return salah('E6', arahBenar === 'kiri'
      ? `x kurang dari ${nilai} berarti bilangan di sebelah kiri ${nilai}.`
      : `x lebih dari ${nilai} berarti bilangan di sebelah kanan ${nilai}.`);
  }
  return benar();
}

/**
 * Mendiagnosis model pertidaksamaan yang disusun siswa dari soal cerita (E7).
 * Model dianggap benar bila ekuivalen dengan model kunci (bentuk boleh berbeda).
 */
export function diagnosisModel(modelKunci, modelSiswa) {
  if (ekuivalen(modelKunci, modelSiswa)) return benar('Model pertidaksamaanmu tepat!');
  const k = selesaikan(modelKunci);
  const s = selesaikan(modelSiswa);
  if (k.jenis === 'batas' && s.jenis === 'batas' && k.nilai.sama(s.nilai)) {
    return salah('E7', arahTanda(k.tanda) !== arahTanda(s.tanda)
      ? 'Angka-angkanya sudah tepat. Perhatikan lagi kata kuncinya: "paling banyak/tidak lebih dari" berarti ≤, "paling sedikit/minimal" berarti ≥.'
      : 'Hampir! Perhatikan apakah batasnya termasuk: "lebih dari" berarti >, "paling sedikit" berarti ≥.');
  }
  return salah('E7', 'Periksa lagi hubungan antarbesaran pada soal. Coba tandai angka-angka penting dan apa yang ditanyakan.');
}

const BATAS_BAWAH_SEMESTA = { cacah: 0, asli: 1 };

/**
 * Nilai bulat ekstrem yang memenuhi hasil, mis. x ≤ 9,5 → 9 (paling banyak),
 * x > 82 → 83 (paling sedikit). Mengembalikan null bila tidak ada batas pada arah itu.
 */
export function nilaiBulatEkstrem(hasil) {
  if (hasil.jenis !== 'batas') return null;
  const n = Pecahan.dari(hasil.nilai);
  switch (hasil.tanda) {
    case '<=': return n.bawah();
    case '<': return n.bulat() ? n.p - 1 : n.bawah();
    case '>=': return n.atas();
    case '>': return n.bulat() ? n.p + 1 : n.atas();
    default: return null;
  }
}

/**
 * Mendiagnosis tafsiran jawaban soal cerita (E8), mis. "paling banyak berapa buku?".
 * @param hasil   hasil selesaikan() dari model
 * @param semesta 'real' | 'bulat' | 'cacah' | 'asli'
 * @param jawabanSiswa  angka yang ditulis siswa
 */
export function diagnosisTafsiran(hasil, semesta, jawabanSiswa) {
  const siswa = Pecahan.dari(jawabanSiswa);
  if (semesta === 'real') {
    return siswa.sama(hasil.nilai) ? benar() : salah('E3', 'Periksa lagi nilai batas yang kamu peroleh.');
  }
  const target = nilaiBulatEkstrem(hasil);
  const bawah = BATAS_BAWAH_SEMESTA[semesta];
  if (target === null || (bawah !== undefined && target < bawah)) {
    return salah('LAIN', 'Tidak ada bilangan pada semesta ini yang memenuhi.');
  }
  if (siswa.sama(target)) return benar();
  const kata = semesta === 'bulat' ? 'bilangan bulat' : 'bilangan cacah';
  if (!siswa.bulat()) return salah('E8', `Jawabannya harus ${kata}. Berapa ${kata} ${hasil.tanda.startsWith('<') ? 'terbesar' : 'terkecil'} yang memenuhi?`);
  if (siswa.sama(hasil.nilai)) return salah('E8', `Tanda ${tampil(hasil.tanda)} berarti ${u(siswa)} tidak termasuk. Berapa ${kata} berikutnya yang memenuhi?`);
  return salah('E3', 'Periksa lagi hitunganmu, lalu cari nilai yang paling sesuai dengan pertanyaan.');
}
