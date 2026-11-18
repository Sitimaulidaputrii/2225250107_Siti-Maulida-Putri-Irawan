/**
 * Instrumen beban kognitif di dalam aplikasi (F12, dokumen 09 §9.4).
 * Hanya tampil bila guru/peneliti mengaktifkan "skalaBeban" untuk kelas.
 *
 * - Skala usaha mental Paas (1992): 1 butir, 1–9.
 * - Kuesioner Leppink dkk. (2013): 10 butir (3 IL, 3 EL, 4 GL), 0–10.
 *   Terjemahan & penyederhanaan untuk siswa SMP — WAJIB divalidasi ahli sebelum dipakai
 *   (lihat docs/instrumen/05-kuesioner-beban-kognitif.md).
 */
import { el } from '../dom.js';
import { catatSkala } from '../penyimpanan.js';

export const LABEL_PAAS = [
  'Sangat sangat ringan', 'Sangat ringan', 'Ringan', 'Agak ringan', 'Sedang',
  'Agak berat', 'Berat', 'Sangat berat', 'Sangat sangat berat',
];

export const BUTIR_LEPPINK = [
  { kode: 'IL1', teks: 'Materi yang dibahas pada kegiatan ini sangat rumit.' },
  { kode: 'IL2', teks: 'Aturan dan rumus yang dibahas pada kegiatan ini sangat rumit.' },
  { kode: 'IL3', teks: 'Konsep dan istilah yang dibahas pada kegiatan ini sangat rumit.' },
  { kode: 'EL1', teks: 'Penjelasan dan petunjuk pada kegiatan ini sangat tidak jelas.' },
  { kode: 'EL2', teks: 'Penjelasan dan petunjuk pada kegiatan ini tidak membantu saya belajar.' },
  { kode: 'EL3', teks: 'Penjelasan dan petunjuk pada kegiatan ini memakai kata-kata yang sulit dipahami.' },
  { kode: 'GL1', teks: 'Kegiatan ini benar-benar menambah pemahaman saya tentang materi.' },
  { kode: 'GL2', teks: 'Kegiatan ini benar-benar menambah pemahaman saya tentang aturan dan rumus.' },
  { kode: 'GL3', teks: 'Kegiatan ini benar-benar menambah pemahaman saya tentang konsep dan istilah.' },
  { kode: 'GL4', teks: 'Kegiatan ini benar-benar menambah pengetahuan dan pemahaman saya.' },
];

function skala(min, max, onPilih, labelUjung) {
  const tombol = [];
  for (let v = min; v <= max; v++) {
    tombol.push(el('button', {
      type: 'button',
      class: 'skala-angka',
      'aria-label': `${v}`,
      onclick: (e) => {
        tombol.forEach((t) => t.classList.toggle('aktif', t === e.currentTarget));
        onPilih(v);
      },
    }, String(v)));
  }
  return el('div', {},
    el('div', { class: 'skala-baris' }, ...tombol),
    el('div', { class: 'skala-ujung' }, el('span', {}, labelUjung[0]), el('span', {}, labelUjung[1])));
}

/** Skala Paas setelah satu aktivitas. */
export function skalaPaas({ aktivitas, onSelesai }) {
  let nilai = null;
  const keterangan = el('p', { class: 'redup', 'aria-live': 'polite' }, ' ');
  const kirim = el('button', {
    type: 'button',
    class: 'tombol',
    disabled: true,
    onclick: async () => {
      await catatSkala({ aktivitas, jenis: 'paas', item: 'usaha', skor: nilai });
      onSelesai();
    },
  }, 'Kirim');
  return el('div', { class: 'kartu skala' },
    el('p', { class: 'aktivitas-label' }, 'Satu pertanyaan singkat'),
    el('p', {}, 'Seberapa besar usaha berpikir yang kamu keluarkan pada kegiatan tadi?'),
    skala(1, 9, (v) => {
      nilai = v;
      keterangan.textContent = LABEL_PAAS[v - 1];
      kirim.disabled = false;
    }, ['Sangat sangat ringan', 'Sangat sangat berat']),
    keterangan,
    el('div', { class: 'baris-tombol' },
      el('button', { type: 'button', class: 'tombol tombol-kedua', onclick: onSelesai }, 'Lewati'),
      kirim));
}

/** Kuesioner Leppink (10 butir) di akhir modul. */
export function kuesionerLeppink({ aktivitas, onSelesai }) {
  const jawaban = {};
  const kirim = el('button', {
    type: 'button',
    class: 'tombol',
    disabled: true,
    onclick: async () => {
      for (const b of BUTIR_LEPPINK) await catatSkala({ aktivitas, jenis: 'leppink', item: b.kode, skor: jawaban[b.kode] });
      onSelesai();
    },
  }, 'Kirim');
  const sisa = el('p', { class: 'redup' });
  const perbarui = () => {
    const n = BUTIR_LEPPINK.length - Object.keys(jawaban).length;
    sisa.textContent = n ? `${n} pernyataan belum dijawab.` : 'Terima kasih! Tekan Kirim.';
    kirim.disabled = n > 0;
  };
  perbarui();
  return el('div', { class: 'kartu skala' },
    el('p', { class: 'aktivitas-label' }, 'Kuesioner singkat'),
    el('p', {}, 'Untuk setiap pernyataan, pilih 0 (sama sekali tidak setuju) sampai 10 (sangat setuju). Tidak ada jawaban benar atau salah.'),
    el('ol', { class: 'daftar-kuesioner' }, ...BUTIR_LEPPINK.map((b) =>
      el('li', {}, el('p', {}, b.teks), skala(0, 10, (v) => {
        jawaban[b.kode] = v;
        perbarui();
      }, ['Tidak setuju', 'Sangat setuju'])))),
    sisa,
    el('div', { class: 'baris-tombol' },
      el('button', { type: 'button', class: 'tombol tombol-kedua', onclick: onSelesai }, 'Lewati'),
      kirim));
}
