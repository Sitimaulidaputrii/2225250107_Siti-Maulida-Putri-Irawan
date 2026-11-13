/**
 * Penyelesai pertidaksamaan linear satu variabel + pembuat langkah penyelesaian.
 *
 * Setiap pertidaksamaan a₁x + b₁ (op) a₂x + b₂ diubah ke bentuk normal A·x (op) B
 * dengan A = a₁ − a₂ dan B = b₂ − b₁. Jika A < 0, tanda dibalik saat membagi.
 */
import { Pecahan } from './pecahan.js';
import { Linear, parsePertidaksamaan } from './parser.js';

const KEBALIKAN = { '<': '>', '>': '<', '<=': '>=', '>=': '<=', '=': '=' };

/** "<" ↔ ">", "<=" ↔ ">=" */
export const balikTanda = (op) => KEBALIKAN[op];

/** "kiri" untuk < dan ≤, "kanan" untuk > dan ≥ (arah arsiran di garis bilangan). */
export const arahTanda = (op) => (op === '<' || op === '<=' ? 'kiri' : op === '>' || op === '>=' ? 'kanan' : null);

/** true untuk ≤ dan ≥ (batas termasuk → bulatan tertutup). */
export const tandaInklusif = (op) => op === '<=' || op === '>=' || op === '=';

const keObjek = (pt) => (typeof pt === 'string' ? parsePertidaksamaan(pt) : pt);

function memenuhiRelasi(kiri, op, kanan) {
  const b = Pecahan.dari(kiri).banding(kanan);
  return { '<': b < 0, '>': b > 0, '<=': b <= 0, '>=': b >= 0, '=': b === 0 }[op];
}

/** Bentuk normal A·x (op) B. */
export function bentukNormal(ptAtauTeks) {
  const { kiri, op, kanan } = keObjek(ptAtauTeks);
  return { A: kiri.a.kurang(kanan.a), B: kanan.b.kurang(kiri.b), op };
}

/**
 * Menyelesaikan pertidaksamaan.
 * @returns {{jenis:'batas', tanda, nilai: Pecahan, dibalik: boolean, pembagi: Pecahan}
 *          | {jenis:'semua'} | {jenis:'kosong'}}
 */
export function selesaikan(ptAtauTeks) {
  const { A, B, op } = bentukNormal(ptAtauTeks);
  if (A.nol()) return { jenis: memenuhiRelasi(0, op, B) ? 'semua' : 'kosong' };
  const dibalik = A.tanda() < 0;
  return { jenis: 'batas', tanda: dibalik ? balikTanda(op) : op, nilai: B.bagi(A), dibalik, pembagi: A };
}

/** Apakah nilai x memenuhi pertidaksamaan? (uji substitusi) */
export function memenuhi(ptAtauTeks, x) {
  const { kiri, op, kanan } = keObjek(ptAtauTeks);
  const nx = Pecahan.dari(x);
  return memenuhiRelasi(kiri.nilaiPada(nx), op, kanan.nilaiPada(nx));
}

export function hasilSama(h1, h2) {
  if (h1.jenis !== h2.jenis) return false;
  if (h1.jenis !== 'batas') return true;
  return h1.tanda === h2.tanda && h1.nilai.sama(h2.nilai);
}

/** Dua pertidaksamaan ekuivalen bila himpunan penyelesaiannya sama. */
export function ekuivalen(p1, p2) {
  return hasilSama(selesaikan(p1), selesaikan(p2));
}

// ---------------------------------------------------------------- format

const SIMBOL_UNICODE = { '<': '<', '>': '>', '<=': '≤', '>=': '≥', '=': '=' };

function teksBilangan(p, unicode) {
  const s = p.toString();
  return unicode ? s.replace(/-/g, '−') : s;
}

function teksKoefisien(a, unicode) {
  if (a.sama(1)) return 'x';
  if (a.sama(-1)) return unicode ? '−x' : '-x';
  const s = teksBilangan(a, unicode);
  return a.bulat() ? `${s}x` : `(${s})x`;
}

/** Linear(−3, 5) -> "-3x + 5" */
export function formatLinear(lin, { unicode = false } = {}) {
  const minus = unicode ? '−' : '-';
  if (lin.a.nol()) return teksBilangan(lin.b, unicode);
  let s = teksKoefisien(lin.a, unicode);
  if (lin.b.tanda() > 0) s += ` + ${teksBilangan(lin.b, unicode)}`;
  if (lin.b.tanda() < 0) s += ` ${minus} ${teksBilangan(lin.b.neg(), unicode)}`;
  return s;
}

export function formatTanda(op, { unicode = false } = {}) {
  return unicode ? SIMBOL_UNICODE[op] : op;
}

export function formatPertidaksamaan({ kiri, op, kanan }, opsi = {}) {
  return `${formatLinear(kiri, opsi)} ${formatTanda(op, opsi)} ${formatLinear(kanan, opsi)}`;
}

/** {tanda:'>=', nilai:-2} -> "x >= -2" (atau "x ≥ −2" bila unicode) */
export function formatHasil(hasil, opsi = {}) {
  if (hasil.jenis === 'semua') return 'semua bilangan memenuhi';
  if (hasil.jenis === 'kosong') return 'tidak ada yang memenuhi';
  return `x ${formatTanda(hasil.tanda, opsi)} ${teksBilangan(Pecahan.dari(hasil.nilai), opsi.unicode)}`;
}

// ------------------------------------------------------- langkah penyelesaian

const sifat = (p) => (p.tanda() < 0 ? 'negatif' : 'positif');

/**
 * true bila ada kurung, pecahan/perkalian eksplisit, atau suku sejenis lebih dari satu
 * di salah satu ruas (mis. "2x + 3x > 5"). Urutan suku saja ("7 - x") tidak dihitung.
 */
export function perluDisederhanakan(teks) {
  const s = String(teks).replace(/[≤≥]/g, '<').replace(/[×·÷:]/g, '*');
  if (/[()/*]/.test(s)) return true;
  return s.split(/<=|>=|<|>|=/).some((ruas) => {
    const banyakX = (ruas.match(/x/gi) || []).length;
    const banyakKonstanta = (ruas.replace(/\d[\d.,]*\s*x/gi, 'x').match(/\d[\d.,]*/g) || []).length;
    return banyakX > 1 || banyakKonstanta > 1;
  });
}

/**
 * Membuat langkah penyelesaian baku dengan gaya yang sama dengan bank soal:
 * (sederhanakan) → kumpulkan x di ruas kiri → pindahkan konstanta → bagi koefisien x.
 * Setiap langkah: { ekspresi, penjelasan, operasi?, kunci? }.
 * `kunci: true` menandai langkah yang menentukan tanda (bagi/kali koefisien x).
 */
export function langkahPenyelesaian(teks) {
  const awal = parsePertidaksamaan(teks);
  let { kiri, kanan } = awal;
  let op = awal.op;
  const langkah = [{ ekspresi: String(teks).trim(), penjelasan: 'Soal awal.' }];
  const tambahLangkah = (penjelasan, operasi, ekstra = {}) =>
    langkah.push({ ekspresi: formatPertidaksamaan({ kiri, op, kanan }), penjelasan, operasi, ...ekstra });

  // 1. Sederhanakan bila bentuk aslinya memuat kurung/pecahan/suku sejenis berulang.
  if (perluDisederhanakan(teks)) {
    tambahLangkah('Sederhanakan kedua ruas (uraikan kurung, gabungkan suku sejenis).', { jenis: 'uraikan', nilai: '' });
  }

  // 2. Kumpulkan suku x di ruas kiri.
  if (!kanan.a.nol()) {
    const c = kanan.a;
    const suku = new Linear(c, 0);
    kiri = kiri.kurang(suku);
    kanan = kanan.kurang(suku);
    const teksSuku = formatLinear(new Linear(c.tanda() < 0 ? c.neg() : c, 0));
    tambahLangkah(
      c.tanda() > 0
        ? `Kurangi kedua ruas dengan ${teksSuku}. Tanda tetap.`
        : `Tambahkan ${teksSuku} pada kedua ruas. Tanda tetap.`,
      { jenis: c.tanda() > 0 ? 'kurang' : 'tambah', nilai: teksSuku },
    );
  }

  // 3. Pindahkan konstanta dari ruas kiri.
  if (!kiri.b.nol()) {
    const b = kiri.b;
    const konst = Linear.konstanta(b);
    kiri = kiri.kurang(konst);
    kanan = kanan.kurang(konst);
    const teksB = (b.tanda() < 0 ? b.neg() : b).toString();
    tambahLangkah(
      b.tanda() > 0
        ? `Kurangi kedua ruas dengan ${teksB}. Tanda tetap.`
        : `Tambahkan ${teksB} pada kedua ruas. Tanda tetap.`,
      { jenis: b.tanda() > 0 ? 'kurang' : 'tambah', nilai: teksB },
    );
  }

  // 4. Tidak ada x tersisa → semua bilangan / tidak ada penyelesaian.
  if (kiri.a.nol()) {
    const hasil = selesaikan({ kiri, op, kanan });
    langkah.push({
      ekspresi: formatHasil(hasil),
      penjelasan:
        hasil.jenis === 'semua'
          ? 'Suku x habis dan pernyataannya selalu benar, jadi semua bilangan memenuhi.'
          : 'Suku x habis dan pernyataannya selalu salah, jadi tidak ada bilangan yang memenuhi.',
    });
    return langkah;
  }

  // 5. Bagi (atau kali −1) dengan koefisien x.
  const a = kiri.a;
  if (!a.sama(1)) {
    const negatif = a.tanda() < 0;
    if (negatif) op = balikTanda(op);
    kanan = Linear.konstanta(kanan.b.bagi(a));
    kiri = Linear.x();
    const akibat = negatif ? 'Tanda dibalik.' : 'Tanda tetap.';
    const operasi = a.sama(-1) ? { jenis: 'kali', nilai: '-1' } : { jenis: 'bagi', nilai: a.toString() };
    const kata = a.sama(-1) ? 'Kalikan kedua ruas dengan -1' : `Bagi kedua ruas dengan ${a}`;
    tambahLangkah(`${kata} (${sifat(a)}). ${akibat}`, operasi, { kunci: true, dibalik: negatif });
  } else {
    langkah[langkah.length - 1].kunci = true;
  }
  return langkah;
}
