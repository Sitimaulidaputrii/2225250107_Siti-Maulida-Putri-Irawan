/**
 * Menampilkan ekspresi matematika dengan HTML biasa (tanpa pustaka tambahan).
 * Warna hanya untuk makna (dokumen 06): suku x biru, konstanta abu, tanda dibalik oranye.
 */
import { el } from '../dom.js';

const POLA_TOKEN = /(\(-?\d+(?:\/\d+)?\)|\d+(?:[.,]\d+)*(?:\/\d+)?)?x|\d+(?:[.,]\d+)*(?:\/\d+)?|<=|>=|[<>=≤≥]|[+\-−*·×/:()]|\s+|./g;
const RELASI = { '<=': '≤', '>=': '≥', '<': '<', '>': '>', '=': '=', '≤': '≤', '≥': '≥' };
const BINER = new Set(['+', '−', '·', ':']);

/** Mengganti tanda minus ASCII dengan minus matematika (−) pada teks biasa. */
export function teksRapi(s) {
  return String(s)
    .replace(/(^|[\s(=<>≤≥])-(?=[\dx(])/g, '$1−')
    .replace(/<=/g, '≤')
    .replace(/>=/g, '≥');
}

function tokenisasi(teks) {
  const hasil = [];
  for (const m of String(teks).matchAll(POLA_TOKEN)) {
    const t = m[0];
    if (/^\s+$/.test(t)) continue;
    hasil.push(t);
  }
  return hasil;
}

/**
 * @param {string} teks  mis. "-3x + 5 <= 11"
 * @param {{dibalik?: boolean, besar?: boolean}} opsi  dibalik → tanda relasi disorot oranye
 */
export function tampilMatematika(teks, { dibalik = false, besar = false } = {}) {
  const wadah = el('span', { class: besar ? 'mat mat-besar' : 'mat', role: 'math', 'aria-label': verbalisasi(teks) });
  let sebelumnya = null; // token sebelumnya, untuk membedakan minus biner/uner
  for (let t of tokenisasi(teks)) {
    if (t === '-') t = '−';
    if (t === '*' || t === '×') t = '·';
    let node;
    if (t.includes('x')) {
      node = el('span', { class: 'mat-x' }, t.replace(/-/g, '−'));
    } else if (/^\d/.test(t)) {
      node = el('span', { class: 'mat-k' }, t);
    } else if (RELASI[t]) {
      node = el('span', { class: dibalik ? 'mat-rel mat-balik' : 'mat-rel' }, ` ${RELASI[t]} `);
    } else if (BINER.has(t)) {
      const uner = t === '−' && (sebelumnya === null || sebelumnya === '(' || RELASI[sebelumnya] || BINER.has(sebelumnya));
      node = el('span', { class: 'mat-op' }, uner ? t : ` ${t} `);
    } else {
      node = el('span', { class: 'mat-op' }, t);
    }
    node.setAttribute('aria-hidden', 'true');
    wadah.append(node);
    sebelumnya = t;
  }
  return wadah;
}

const KATA = [
  [/<=|≤/g, ' kurang dari atau sama dengan '],
  [/>=|≥/g, ' lebih dari atau sama dengan '],
  [/</g, ' kurang dari '],
  [/>/g, ' lebih dari '],
  [/=/g, ' sama dengan '],
  [/[−-]/g, ' minus '],
  [/\+/g, ' tambah '],
  [/[*·×]/g, ' kali '],
  [/[/:]/g, ' per '],
];

/** Teks untuk pembaca layar, mis. "−3x ≤ 6" → "minus 3x kurang dari atau sama dengan 6". */
export function verbalisasi(teks) {
  let s = String(teks);
  for (const [pola, ganti] of KATA) s = s.replace(pola, ganti);
  return s.replace(/\s+/g, ' ').trim();
}
