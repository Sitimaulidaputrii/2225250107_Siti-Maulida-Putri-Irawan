/**
 * Lab Garis Bilangan (US05, F4.1): siswa memilih dua bilangan A < B dan sebuah operasi,
 * menebak tanda setelah operasi, lalu MELIHAT titik-titiknya bergerak di garis bilangan.
 * Setelah beberapa percobaan (positif & negatif), siswa diminta menyimpulkan aturannya.
 */
import { garisPerbandingan } from '../components/garisBilangan.js';
import { renderButir } from '../components/soal.js';
import { el } from '../dom.js';
import { Pecahan } from '../engine/pecahan.js';
import { tampilMatematika, teksRapi } from '../ui/matematika.js';

const OPERASI = {
  kali: { lambang: '·', kata: 'Kalikan' },
  bagi: { lambang: ':', kata: 'Bagi' },
};

function pengatur(label, nilaiAwal, { min, max, lewati = [] }, onUbah) {
  let v = nilaiAwal;
  const keluaran = el('output', { class: 'garis-nilai' });
  const tampil = () => (keluaran.textContent = teksRapi(String(v)));
  const geser = (d) => {
    let n = v + d;
    while (lewati.includes(n)) n += d;
    if (n < min || n > max) return;
    v = n;
    tampil();
    onUbah(v);
  };
  tampil();
  return el('div', { class: 'garis-baris' },
    el('span', { class: 'garis-judul' }, label),
    el('button', { type: 'button', class: 'pil', 'aria-label': `Kurangi ${label}`, onclick: () => geser(-1) }, '−'),
    keluaran,
    el('button', { type: 'button', class: 'pil', 'aria-label': `Tambah ${label}`, onclick: () => geser(1) }, '+'));
}

export function lab() {
  const s = { a: 2, b: 6, jenis: 'kali', n: -1 };
  const riwayat = [];
  const arena = el('div', {});
  const catatan = el('div', {});
  const kesimpulan = el('div', {});

  const kendali = el('div', { class: 'garis-kendali kartu' },
    pengatur('A', s.a, { min: -9, max: 9 }, (v) => { s.a = v; }),
    pengatur('B', s.b, { min: -9, max: 9 }, (v) => { s.b = v; }),
    el('div', { class: 'garis-baris' },
      el('span', { class: 'garis-judul' }, 'Operasi'),
      ...Object.entries(OPERASI).map(([k, o]) => {
        const b = el('button', { type: 'button', class: k === s.jenis ? 'pil aktif' : 'pil', onclick: () => {
          s.jenis = k;
          for (const x of b.parentElement.querySelectorAll('.pil')) x.classList.toggle('aktif', x === b);
        } }, o.kata);
        return b;
      })),
    pengatur('dengan', s.n, { min: -5, max: 5, lewati: [0] }, (v) => { s.n = v; }),
    el('button', { type: 'button', class: 'tombol', onclick: coba }, 'Coba'));

  function coba() {
    if (s.a === s.b) {
      arena.replaceChildren(el('p', { class: 'umpan umpan-cek' }, 'Pilih A dan B yang berbeda.'));
      return;
    }
    const a = new Pecahan(s.a);
    const b = new Pecahan(s.b);
    const n = new Pecahan(s.n);
    const a2 = a[s.jenis](n);
    const b2 = b[s.jenis](n);
    const t1 = a.banding(b) < 0 ? '<' : '>';
    const t2 = a2.banding(b2) < 0 ? '<' : '>';
    const nTeks = s.n < 0 ? `(${s.n})` : `${s.n}`;
    const lambang = OPERASI[s.jenis].lambang;

    const tanya = el('div', { class: 'butir' },
      el('p', { class: 'butir-tanya' }, 'Sebelum: ', tampilMatematika(`${s.a} ${t1} ${s.b}`),
        `. Sesudah ${OPERASI[s.jenis].kata.toLowerCase()} ${teksRapi(nTeks)}:`),
      el('div', { class: 'soal-besar' }, tampilMatematika(`${s.a} ${lambang} ${nTeks}`), el('span', { class: 'mat mat-besar kotak-tanya' }, ' ? '), tampilMatematika(`${s.b} ${lambang} ${nTeks}`)));
    const pilihan = ['<', '>'].map((t) => el('button', { type: 'button', class: 'opsi', onclick: () => jawab(t) }, el('span', { class: 'mat mat-besar' }, t)));
    tanya.append(el('p', {}, 'Tebak dulu tandanya:'), el('div', { class: 'daftar-opsi dua-kolom' }, ...pilihan));
    arena.replaceChildren(tanya);

    function jawab(t) {
      pilihan.forEach((p) => (p.disabled = true));
      const tetap = t1 === t2;
      tanya.append(
        el('div', { class: t === t2 ? 'umpan umpan-benar' : 'umpan umpan-cek' },
          el('p', { class: 'umpan-judul' }, t === t2 ? 'Tebakanmu tepat! 🙂' : 'Lihat garis bilangannya:'),
          el('p', {}, tampilMatematika(`${a2} ${t2} ${b2}`, { dibalik: !tetap }), tetap ? ' — tanda tetap.' : ' — tanda dibalik!')),
        garisPerbandingan({ a, b, a2, b2 }));
      riwayat.push({ teks: `${s.a} ${t1} ${s.b}  →  ${lambang} ${nTeks}  →  ${a2} ${t2} ${b2}`, tetap, negatif: s.n < 0 });
      perbaruiCatatan();
    }
  }

  function perbaruiCatatan() {
    catatan.replaceChildren(el('h2', {}, 'Catatan percobaanmu'),
      el('ol', { class: 'daftar-catatan' }, ...riwayat.map((r) =>
        el('li', { class: r.tetap ? '' : 'catatan-balik' }, tampilMatematika(r.teks, { dibalik: !r.tetap }), r.tetap ? ' tetap' : ' ⇄ dibalik'))));
    const adaPositif = riwayat.some((r) => !r.negatif);
    const adaNegatif = riwayat.filter((r) => r.negatif).length >= 2;
    if (adaPositif && adaNegatif && !kesimpulan.hasChildNodes()) {
      kesimpulan.append(el('div', { class: 'aktivitas' },
        el('p', { class: 'aktivitas-label' }, 'Simpulkan!'),
        renderButir({
          tipe: 'pilihan',
          pertanyaan: 'Dari percobaanmu, kapan tanda pertidaksamaan dibalik?',
          opsi: [
            'Saat kedua ruas dikali atau dibagi bilangan negatif',
            'Saat hasilnya menjadi bilangan negatif',
            'Setiap kali kedua ruas dikali atau dibagi',
          ],
          benar: 0,
          umpan: [null, 'Lihat lagi catatanmu: ada hasil negatif yang tandanya tetap?', 'Lihat lagi catatanmu: saat dikali bilangan positif, tandanya berubah?'],
          pembahasan: 'Aturan: jika kedua ruas **dikali atau dibagi bilangan negatif**, tanda dibalik.',
        })));
    }
  }

  return el('div', { class: 'halaman' },
    el('a', { href: '#/', class: 'kembali' }, '← Beranda'),
    el('h1', {}, 'Lab Garis Bilangan'),
    el('p', { class: 'redup' }, 'Pilih dua bilangan dan sebuah operasi. Tebak tandanya, lalu lihat apa yang terjadi di garis bilangan.'),
    kendali, arena, catatan, kesimpulan);
}
