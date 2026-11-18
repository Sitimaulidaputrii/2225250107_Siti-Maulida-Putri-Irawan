/** Halaman alat: Latihan Bebas, Progresku, Pengaturan. */
import { latihan } from '../components/latihan.js';
import { el } from '../dom.js';
import { statusAwal } from '../engine/adaptif.js';
import { NAMA_KESALAHAN } from '../engine/diagnosis.js';
import { DAFTAR_MODUL } from '../modul.js';
import { ambilPengaturan, simpanPengaturan } from '../pengaturan.js';
import { ambilProgres, ambilSemuaPercobaan } from '../penyimpanan.js';
import { muatKonten } from './modul.js';
import { bagianKelas } from './kelas.js';

const kembali = () => el('a', { href: '#/', class: 'kembali' }, '← Beranda');

// ------------------------------------------------------------- latihan bebas

const LEVEL = [
  { level: 1, judul: 'Level 1', ringkas: 'Satu langkah' },
  { level: 2, judul: 'Level 2', ringkas: 'Dua langkah, pembagi positif' },
  { level: 3, judul: 'Level 3', ringkas: 'Pembagi negatif (tanda dibalik)' },
  { level: 4, judul: 'Level 4', ringkas: 'x di dua ruas, tanda kurung' },
];

export function latihanBebas(levelTeks) {
  const level = Number(levelTeks);
  if (!LEVEL.some((l) => l.level === level)) {
    return el('div', { class: 'halaman' }, kembali(),
      el('h1', {}, 'Latihan Bebas'),
      el('p', { class: 'redup' }, 'Soal acak tanpa batas untuk menguji pemahamanmu. Pilih level:'),
      el('ul', { class: 'daftar-bagian' }, ...LEVEL.map((l) =>
        el('li', {}, el('a', { href: `#/latihan/${l.level}`, class: 'bagian' },
          el('span', { class: 'bagian-judul' }, l.judul), el('span', { class: 'alat-ringkas' }, l.ringkas))))));
  }
  return el('div', { class: 'halaman' },
    el('a', { href: '#/latihan', class: 'kembali' }, '← Pilih level'),
    el('h1', {}, `Latihan Bebas · Level ${level}`),
    latihan({
      status: { ...statusAwal(level), fase: 'mandiri' },
      pengaturan: { level },
      lewatiContoh: true,
      onSimpan: () => {},
      onTuntas: () => {},
      idModul: 'bebas',
    }));
}

// ------------------------------------------------------------------ progres

/** Modul untuk berlatih ulang menurut jenis kesalahan. */
const MODUL_PENGUATAN = { E1: 'M4', E2: 'M4', E3: 'M0', E4: 'M3', E5: 'M2', E6: 'M2', E7: 'M6', E8: 'M6' };

export function ringkasKesalahan(percobaan) {
  const hitung = {};
  for (const p of percobaan) if (!p.benar && p.kode && p.kode !== 'LAIN') hitung[p.kode] = (hitung[p.kode] ?? 0) + 1;
  return Object.entries(hitung).sort((a, b) => b[1] - a[1]);
}

export function progres() {
  const wadah = el('div', { class: 'halaman' }, kembali(), el('h1', {}, 'Progresku'), el('p', { class: 'redup' }, 'Memuat…'));
  const tersedia = DAFTAR_MODUL.filter((m) => m.tersedia);
  Promise.all([
    Promise.all(tersedia.map((m) => Promise.all([muatKonten(m.id), ambilProgres(m.id)]))),
    ambilSemuaPercobaan(),
  ]).then(([data, percobaan]) => {
    const benar = percobaan.filter((p) => p.benar).length;
    const kesalahan = ringkasKesalahan(percobaan);
    wadah.replaceChildren(kembali(), el('h1', {}, 'Progresku'),
      el('div', { class: 'kartu skor' },
        el('p', { class: 'skor-angka' }, `${benar} / ${percobaan.length}`),
        el('p', {}, 'jawaban benar dari semua percobaan')),
      el('h2', {}, 'Modul'),
      el('ul', { class: 'daftar-bagian' }, ...tersedia.map((m, i) => {
        const [konten, p] = data[i];
        const total = konten?.bagian.length ?? 0;
        const persen = total ? Math.round((p.selesai.length / total) * 100) : 0;
        const kuis = Object.values(p.kuis).map((k) => `${k.skor}%`).join(', ');
        return el('li', {}, el('a', { href: `#/modul/${m.id}`, class: 'bagian progres-modul' },
          el('span', { class: 'bagian-judul' }, `${m.id} · ${m.judul}`),
          el('span', { class: 'bilah', role: 'progressbar', 'aria-valuenow': String(persen), 'aria-valuemin': '0', 'aria-valuemax': '100' },
            el('span', { class: 'bilah-isi', style: `width:${persen}%` })),
          el('span', { class: 'alat-ringkas' }, `${p.selesai.length}/${total} bagian${kuis ? ` · kuis ${kuis}` : ''}`)));
      })),
      el('h2', {}, 'Yang perlu diperkuat'),
      kesalahan.length
        ? el('ul', { class: 'daftar-bagian' }, ...kesalahan.slice(0, 3).map(([kode, n]) =>
          el('li', {}, el('a', { href: `#/modul/${MODUL_PENGUATAN[kode]}`, class: 'bagian' },
            el('span', { class: 'bagian-judul' }, NAMA_KESALAHAN[kode]),
            el('span', { class: 'alat-ringkas' }, `${n}× · latih di ${MODUL_PENGUATAN[kode]}`)))))
        : el('p', { class: 'redup' }, 'Belum ada pola kesalahan. Terus berlatih! 💪'));
  });
  return wadah;
}

// --------------------------------------------------------------- pengaturan

function grupPilihan(judul, opsi, nilai, onPilih) {
  const tombol = opsi.map(([v, label]) => el('button', {
    type: 'button',
    class: v === nilai ? 'pil aktif' : 'pil',
    'aria-pressed': String(v === nilai),
    onclick: () => {
      tombol.forEach((t) => { t.classList.toggle('aktif', t.dataset.v === v); t.setAttribute('aria-pressed', String(t.dataset.v === v)); });
      onPilih(v);
    },
  }, label));
  tombol.forEach((t, i) => (t.dataset.v = opsi[i][0]));
  return el('div', { class: 'grup-pengaturan' }, el('p', { class: 'garis-judul lebar' }, judul), el('div', { class: 'garis-baris' }, ...tombol));
}

export function pengaturan() {
  const wadah = el('div', { class: 'halaman' }, kembali(), el('h1', {}, 'Pengaturan'));
  ambilPengaturan().then((p) => {
    wadah.append(
      el('section', { class: 'kartu' },
        el('h2', {}, 'Tampilan'),
        grupPilihan('Ukuran huruf', [['normal', 'Normal'], ['besar', 'Besar'], ['sangat-besar', 'Sangat besar']], p.ukuranHuruf,
          (v) => simpanPengaturan({ ukuranHuruf: v })),
        grupPilihan('Tema', [['sistem', 'Ikuti HP'], ['terang', 'Terang'], ['gelap', 'Gelap']], p.tema,
          (v) => simpanPengaturan({ tema: v })),
        grupPilihan('Animasi', [['normal', 'Normal'], ['kurangi', 'Kurangi']], p.kurangiAnimasi ? 'kurangi' : 'normal',
          (v) => simpanPengaturan({ kurangiAnimasi: v === 'kurangi' }))),
      bagianKelas());
  });
  return wadah;
}
