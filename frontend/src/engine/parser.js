/**
 * Pengurai (parser) pertidaksamaan linear satu variabel.
 *
 * Contoh masukan yang diterima:
 *   "-3x + 5 <= 11"   "2(x - 3) < 5x + 9"   "x/2 + 1 ≥ 4"   "7 − x < 10"
 *   "14.000 + 4.000x ≤ 50.000"  (titik sebagai pemisah ribuan, gaya Indonesia)
 *   "2,5x > 5"  (koma sebagai tanda desimal)
 *
 * Setiap ruas diubah menjadi bentuk linear a·x + b dengan a, b bilangan rasional.
 *
 * Tata bahasa:
 *   ekspresi := suku (('+' | '-') suku)*
 *   suku     := faktor (('*' | '/') faktor | faktor-implisit)*
 *   faktor   := ('+' | '-') faktor | primer
 *   primer   := angka | 'x' | '(' ekspresi ')'
 * Perkalian implisit hanya sebelum 'x' atau '(' — mis. "2x", "3(x+1)".
 */
import { NOL, Pecahan, SATU } from './pecahan.js';

export class GalatParse extends Error {
  constructor(pesan, posisi = null) {
    super(pesan);
    this.name = 'GalatParse';
    this.posisi = posisi;
  }
}

/** Bentuk linear a·x + b */
export class Linear {
  constructor(a = NOL, b = NOL) {
    this.a = Pecahan.dari(a);
    this.b = Pecahan.dari(b);
    Object.freeze(this);
  }

  static konstanta(b) {
    return new Linear(NOL, b);
  }

  static x() {
    return new Linear(SATU, NOL);
  }

  tambah(o) {
    return new Linear(this.a.tambah(o.a), this.b.tambah(o.b));
  }

  kurang(o) {
    return new Linear(this.a.kurang(o.a), this.b.kurang(o.b));
  }

  neg() {
    return new Linear(this.a.neg(), this.b.neg());
  }

  kali(o) {
    if (!this.a.nol() && !o.a.nol()) {
      throw new GalatParse('Bentuk ini bukan linear (ada x dikali x).');
    }
    // (a1x + b1)(a2x + b2) dengan a1·a2 = 0
    return new Linear(this.a.kali(o.b).tambah(o.a.kali(this.b)), this.b.kali(o.b));
  }

  bagi(o) {
    if (!o.a.nol()) throw new GalatParse('Tidak bisa membagi dengan bentuk yang memuat x.');
    if (o.b.nol()) throw new GalatParse('Tidak boleh membagi dengan nol.');
    return new Linear(this.a.bagi(o.b), this.b.bagi(o.b));
  }

  /** Nilai bentuk ini untuk x tertentu. */
  nilaiPada(x) {
    return this.a.kali(x).tambah(this.b);
  }
}

const RELASI = ['<=', '>=', '<', '>', '='];

function normalisasi(teks) {
  return String(teks)
    .replace(/[−–—]/g, '-')
    .replace(/[×·]/g, '*')
    .replace(/[÷:]/g, '/')
    .replace(/≤/g, '<=')
    .replace(/≥/g, '>=')
    .replace(/=</g, '<=')
    .replace(/=>/g, '>=');
}

const POLA_RIBUAN = /^\d{1,3}(?:\.\d{3})+(?![\d.])(?:,\d+)?/;
const POLA_ANGKA = /^\d+(?:[.,]\d+)?/;

function tokenisasi(teks) {
  const token = [];
  let i = 0;
  while (i < teks.length) {
    const c = teks[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if (/\d/.test(c)) {
      const sisa = teks.slice(i);
      let m = POLA_RIBUAN.exec(sisa);
      let nilai;
      if (m) {
        nilai = Pecahan.dari(m[0].replace(/\./g, ''));
      } else {
        m = POLA_ANGKA.exec(sisa);
        nilai = Pecahan.dari(m[0]);
      }
      token.push({ jenis: 'angka', nilai, posisi: i });
      i += m[0].length;
      continue;
    }
    if (c === 'x' || c === 'X') {
      token.push({ jenis: 'x', posisi: i });
      i++;
      continue;
    }
    if ('+-*/()'.includes(c)) {
      token.push({ jenis: c, posisi: i });
      i++;
      continue;
    }
    if (c === '<' || c === '>' || c === '=') {
      const dua = teks.slice(i, i + 2);
      const op = dua === '<=' || dua === '>=' ? dua : c;
      token.push({ jenis: 'relasi', op, posisi: i });
      i += op.length;
      continue;
    }
    if (c === '^') throw new GalatParse('Pangkat tidak digunakan pada pertidaksamaan linear.', i);
    if (/[a-zA-Z]/.test(c)) throw new GalatParse(`Gunakan variabel x (ditemukan "${c}").`, i);
    throw new GalatParse(`Karakter "${c}" tidak dikenali.`, i);
  }
  return token;
}

function uraikanEkspresi(token) {
  let i = 0;
  const lihat = () => token[i];
  const ambil = () => token[i++];

  function ekspresi() {
    let hasil = suku();
    while (lihat() && (lihat().jenis === '+' || lihat().jenis === '-')) {
      const op = ambil().jenis;
      const kanan = suku();
      hasil = op === '+' ? hasil.tambah(kanan) : hasil.kurang(kanan);
    }
    return hasil;
  }

  function suku() {
    let hasil = faktor();
    for (;;) {
      const t = lihat();
      if (t && (t.jenis === '*' || t.jenis === '/')) {
        ambil();
        const kanan = faktor();
        hasil = t.jenis === '*' ? hasil.kali(kanan) : hasil.bagi(kanan);
      } else if (t && (t.jenis === 'x' || t.jenis === '(')) {
        hasil = hasil.kali(faktor()); // perkalian implisit: 2x, 3(x+1)
      } else {
        return hasil;
      }
    }
  }

  function faktor() {
    const t = lihat();
    if (t && t.jenis === '-') {
      ambil();
      return faktor().neg();
    }
    if (t && t.jenis === '+') {
      ambil();
      return faktor();
    }
    return primer();
  }

  function primer() {
    const t = ambil();
    if (!t) throw new GalatParse('Bentuk aljabar belum lengkap.');
    if (t.jenis === 'angka') return Linear.konstanta(t.nilai);
    if (t.jenis === 'x') return Linear.x();
    if (t.jenis === '(') {
      const isi = ekspresi();
      const tutup = ambil();
      if (!tutup || tutup.jenis !== ')') throw new GalatParse('Kurung tutup ")" belum ada.', t.posisi);
      return isi;
    }
    throw new GalatParse(`Tanda "${t.jenis}" tidak berada di tempat yang tepat.`, t.posisi);
  }

  if (token.length === 0) throw new GalatParse('Ruas ini masih kosong.');
  const hasil = ekspresi();
  if (i < token.length) {
    const t = token[i];
    throw new GalatParse(
      t.jenis === ')' ? 'Ada kurung tutup ")" yang berlebih.' : 'Bentuk aljabar tidak dapat dibaca.',
      t.posisi,
    );
  }
  return hasil;
}

/** Mengurai satu ruas, mis. "2(x - 3)" -> Linear(2, -6). */
export function parseLinear(teks) {
  const token = tokenisasi(normalisasi(teks));
  if (token.some((t) => t.jenis === 'relasi')) throw new GalatParse('Ruas tidak boleh memuat tanda pertidaksamaan.');
  return uraikanEkspresi(token);
}

/**
 * Mengurai pertidaksamaan (atau persamaan) lengkap.
 * @returns {{kiri: Linear, op: '<'|'>'|'<='|'>='|'=', kanan: Linear}}
 */
export function parsePertidaksamaan(teks) {
  const token = tokenisasi(normalisasi(teks));
  const posisiRelasi = token.flatMap((t, idx) => (t.jenis === 'relasi' ? [idx] : []));
  if (posisiRelasi.length === 0) throw new GalatParse('Belum ada tanda <, >, ≤, atau ≥.');
  if (posisiRelasi.length > 1) throw new GalatParse('Hanya boleh ada satu tanda pertidaksamaan.');
  const k = posisiRelasi[0];
  const op = token[k].op;
  if (!RELASI.includes(op)) throw new GalatParse(`Tanda "${op}" tidak dikenali.`);
  return {
    kiri: uraikanEkspresi(token.slice(0, k)),
    op,
    kanan: uraikanEkspresi(token.slice(k + 1)),
  };
}
