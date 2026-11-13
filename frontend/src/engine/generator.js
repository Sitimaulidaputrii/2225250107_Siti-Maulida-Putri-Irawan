/**
 * Generator soal acak level 1–4 untuk "Latihan Bebas".
 * Soal dibangun MUNDUR dari jawaban bulat yang dipilih, sehingga jawabannya selalu
 * bilangan bulat; kunci lalu dihitung ulang oleh penyelesai (satu sumber kebenaran).
 *
 * Gunakan acakBerbenih(benih) agar soal dapat diulang (mis. untuk pengujian).
 */
import { langkahPenyelesaian, selesaikan } from './penyelesai.js';

/** PRNG kecil dan cepat (mulberry32). Mengembalikan fungsi → bilangan [0, 1). */
export function acakBerbenih(benih = Date.now()) {
  let s = benih >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TANDA = ['<', '>', '<=', '>='];

function alat(rng) {
  const bulat = (min, maks) => min + Math.floor(rng() * (maks - min + 1));
  const bukanNol = (min, maks) => {
    let n;
    do n = bulat(min, maks);
    while (n === 0);
    return n;
  };
  const pilih = (daftar) => daftar[Math.floor(rng() * daftar.length)];
  return { bulat, bukanNol, pilih };
}

/** 3 -> "3x", 1 -> "x", -1 -> "-x", -4 -> "-4x" */
const sukuX = (a) => (a === 1 ? 'x' : a === -1 ? '-x' : `${a}x`);
/** Menambahkan konstanta di belakang: ("2x", -5) -> "2x - 5" */
const plus = (depan, b) => (b === 0 ? depan : b > 0 ? `${depan} + ${b}` : `${depan} - ${-b}`);

const PEMBUAT = {
  // Level 1 — satu langkah, tanpa pembalikan tanda
  // opsi.hanya = 'tambahKurang' → hanya bentuk x ± b (untuk modul M3)
  1(r, opsi) {
    const s = r.bulat(-10, 10);
    const op = r.pilih(TANDA);
    if (opsi.hanya === 'tambahKurang' || r.bulat(0, 1) === 0) {
      const b = r.bukanNol(-9, 9);
      return `${plus('x', b)} ${op} ${s + b}`;
    }
    const a = r.bulat(2, 9);
    return `${sukuX(a)} ${op} ${a * s}`;
  },

  // Level 2 — dua langkah, koefisien positif
  2(r) {
    const a = r.bulat(2, 9);
    const b = r.bukanNol(-12, 12);
    const s = r.bulat(-10, 10);
    const op = r.pilih(TANDA);
    return r.bulat(0, 3) === 0
      ? `${b} + ${sukuX(a)} ${op} ${a * s + b}` // variasi urutan: "-5 + 3x > 7"
      : `${plus(sukuX(a), b)} ${op} ${a * s + b}`;
  },

  // Level 3 — koefisien negatif (tanda harus dibalik)
  3(r) {
    const a = -r.bulat(1, 9);
    const b = r.bukanNol(-12, 12);
    const s = r.bulat(-10, 10);
    const op = r.pilih(TANDA);
    const c = a * s + b;
    // Variasi bentuk: "-3x + 5 < 11" atau "5 - 3x < 11"
    if (r.bulat(0, 1) === 0) return `${plus(sukuX(a), b)} ${op} ${c}`;
    return `${b} - ${sukuX(-a)} ${op} ${c}`;
  },

  // Level 4 — variabel di dua ruas atau tanda kurung
  4(r) {
    const s = r.bulat(-8, 8);
    const op = r.pilih(TANDA);
    if (r.bulat(0, 1) === 0) {
      const a = r.bulat(1, 9);
      let c;
      do c = r.bulat(1, 9);
      while (c === a);
      const b = r.bukanNol(-10, 10);
      const d = (a - c) * s + b;
      return `${plus(sukuX(a), b)} ${op} ${plus(sukuX(c), d)}`;
    }
    const k = r.bulat(2, 5);
    const m = r.bukanNol(-6, 6);
    let c;
    do c = r.bulat(1, 9);
    while (c === k);
    const d = k * (s + m) - c * s;
    return `${k}(${plus('x', m)}) ${op} ${plus(sukuX(c), d)}`;
  },
};

/**
 * Membuat satu soal acak.
 * @returns {{id, level, jenis:'aljabar', soal, semesta:'real', jawaban:{tanda, nilai}, langkah}}
 */
export function buatSoal(level, rng = acakBerbenih(), opsi = {}) {
  const pembuat = PEMBUAT[level];
  if (!pembuat) throw new RangeError(`Generator hanya tersedia untuk level 1–4 (diminta: ${level})`);
  const soal = pembuat(alat(rng), opsi);
  const hasil = selesaikan(soal);
  return {
    id: `acak-${level}-${Math.floor(rng() * 1e9).toString(36)}`,
    level,
    jenis: 'aljabar',
    soal,
    semesta: 'real',
    jawaban: { tanda: hasil.tanda, nilai: hasil.nilai.toString() },
    langkah: langkahPenyelesaian(soal),
  };
}
