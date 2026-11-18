/**
 * Garis bilangan SVG — statis (menampilkan himpunan penyelesaian) atau interaktif
 * (siswa menempatkan titik batas, memilih bulatan terbuka/tertutup, dan arah arsiran).
 */
import { el } from '../dom.js';
import { Pecahan } from '../engine/pecahan.js';
import { arahTanda, selesaikan, tandaInklusif } from '../engine/penyelesai.js';

const NS = 'http://www.w3.org/2000/svg';
const L = 360; // lebar viewBox
const T = 72; // tinggi viewBox
const TEPI = 22;
const Y = 30;

function svg(tag, atribut = {}) {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(atribut)) n.setAttribute(k, v);
  return n;
}

const minus = (n) => String(n).replace('-', '−');

/** Rentang bilangan bulat yang nyaman di sekitar nilai batas. */
export function rentangUntuk(nilai, lebar = 6) {
  const v = nilai === null || nilai === undefined ? 0 : Math.round(Pecahan.dari(nilai).keNumber());
  return { min: v - lebar, max: v + lebar };
}

/** Mengubah teks hasil ("x >= -2") atau soal menjadi {nilai, bulatan, arah}. */
export function keadaanDariHasil(teks) {
  const h = selesaikan(teks);
  if (h.jenis !== 'batas') return null;
  return { nilai: h.nilai, bulatan: tandaInklusif(h.tanda) ? 'tertutup' : 'terbuka', arah: arahTanda(h.tanda) };
}

/**
 * @param {object} p
 * @param {number} p.min, p.max          rentang bilangan bulat
 * @param {{nilai, bulatan, arah}} [p.keadaan]
 * @param {boolean} [p.interaktif]
 * @param {(keadaan) => void} [p.onUbah]
 * @param {string} [p.label]             deskripsi untuk pembaca layar
 */
export function garisBilangan({ min, max, keadaan = null, interaktif = false, onUbah = () => {}, label = 'Garis bilangan' }) {
  let k = keadaan ? { ...keadaan } : { nilai: null, bulatan: 'terbuka', arah: null };
  const lebarSatuan = (L - 2 * TEPI) / (max - min);
  const posX = (v) => TEPI + (Pecahan.dari(v).keNumber() - min) * lebarSatuan;
  const labelSetiap = max - min > 14 ? 2 : 1;

  const gambar = svg('svg', { viewBox: `0 0 ${L} ${T}`, class: 'garis-svg', role: 'img', 'aria-label': label });
  const lapisanHasil = svg('g');

  // Sumbu dengan panah di kedua ujung
  gambar.append(
    svg('line', { x1: 4, y1: Y, x2: L - 4, y2: Y, class: 'garis-sumbu' }),
    svg('path', { d: `M4 ${Y} l8 -5 v10 z`, class: 'garis-panah-sumbu' }),
    svg('path', { d: `M${L - 4} ${Y} l-8 -5 v10 z`, class: 'garis-panah-sumbu' }),
  );
  for (let v = min; v <= max; v++) {
    const x = posX(v);
    gambar.append(svg('line', { x1: x, y1: Y - 6, x2: x, y2: Y + 6, class: 'garis-tik' }));
    if ((v - min) % labelSetiap === 0 || v === 0) {
      const teks = svg('text', { x, y: Y + 24, class: v === 0 ? 'garis-label nol' : 'garis-label' });
      teks.textContent = minus(v);
      gambar.append(teks);
    }
  }
  gambar.append(lapisanHasil);

  function gambarUlang() {
    lapisanHasil.replaceChildren();
    if (k.nilai === null) return;
    const x = posX(k.nilai);
    if (k.arah) {
      const ujung = k.arah === 'kanan' ? L - 10 : 10;
      lapisanHasil.append(
        svg('line', { x1: x, y1: Y, x2: ujung, y2: Y, class: 'garis-arsir' }),
        svg('path', {
          d: k.arah === 'kanan' ? `M${L - 4} ${Y} l-12 -8 v16 z` : `M4 ${Y} l12 -8 v16 z`,
          class: 'garis-panah-arsir',
        }),
      );
    }
    lapisanHasil.append(
      svg('circle', { cx: x, cy: Y, r: 7, class: k.bulatan === 'tertutup' ? 'garis-titik tertutup' : 'garis-titik' }),
    );
  }

  const wadah = el('div', { class: 'garis' }, gambar);

  if (interaktif) {
    // Area ketuk untuk setiap bilangan bulat
    for (let v = min; v <= max; v++) {
      const area = svg('rect', {
        x: posX(v) - lebarSatuan / 2, y: 0, width: lebarSatuan, height: T, class: 'garis-area',
      });
      area.addEventListener('click', () => ubah({ nilai: new Pecahan(v) }));
      gambar.append(area);
    }

    const tombolPilih = (teks, aktif, aksi, aria) =>
      el('button', { type: 'button', class: aktif ? 'pil aktif' : 'pil', 'aria-pressed': String(aktif), 'aria-label': aria, onclick: aksi }, teks);

    const kendali = el('div', { class: 'garis-kendali' });
    const renderKendali = () => {
      const nilaiTeks = k.nilai === null ? 'belum dipilih' : minus(k.nilai);
      kendali.replaceChildren(
        el('div', { class: 'garis-baris' },
          el('span', { class: 'garis-judul' }, 'Titik'),
          tombolPilih('◀', false, () => geser(-1), 'Geser titik ke kiri'),
          el('output', { class: 'garis-nilai', 'aria-live': 'polite' }, nilaiTeks),
          tombolPilih('▶', false, () => geser(1), 'Geser titik ke kanan')),
        el('div', { class: 'garis-baris' },
          el('span', { class: 'garis-judul' }, 'Bulatan'),
          tombolPilih('○ Terbuka', k.bulatan === 'terbuka', () => ubah({ bulatan: 'terbuka' })),
          tombolPilih('● Tertutup', k.bulatan === 'tertutup', () => ubah({ bulatan: 'tertutup' }))),
        el('div', { class: 'garis-baris' },
          el('span', { class: 'garis-judul' }, 'Arah'),
          tombolPilih('← Kiri', k.arah === 'kiri', () => ubah({ arah: 'kiri' })),
          tombolPilih('Kanan →', k.arah === 'kanan', () => ubah({ arah: 'kanan' }))),
      );
    };

    function geser(d) {
      const sekarang = k.nilai === null ? Math.round((min + max) / 2) - d : Pecahan.dari(k.nilai).keNumber();
      const baru = Math.min(max, Math.max(min, Math.round(sekarang) + d));
      ubah({ nilai: new Pecahan(baru) });
    }

    function ubah(perubahan) {
      k = { ...k, ...perubahan };
      gambarUlang();
      renderKendali();
      onUbah({ ...k });
    }

    renderKendali();
    wadah.append(el('p', { class: 'petunjuk-kecil' }, 'Ketuk garis untuk menaruh titik.'), kendali);
  }

  gambarUlang();
  return { el: wadah, ambil: () => ({ ...k }) };
}

/**
 * Garis bilangan "sebelum → sesudah" untuk dua bilangan A dan B (desain D03).
 * Titik bergerak dari posisi lama ke posisi baru; saat dikali/dibagi bilangan negatif,
 * terlihat bahwa urutan A dan B BERTUKAR (pencerminan) sehingga tanda harus dibalik.
 */
export function garisPerbandingan({ a, b, a2, b2 }) {
  const nilai = [a, b, a2, b2].map((x) => Pecahan.dari(x).keNumber());
  const min = Math.floor(Math.min(...nilai, 0)) - 1;
  const max = Math.ceil(Math.max(...nilai, 0)) + 1;
  const lebarSatuan = (L - 2 * TEPI) / (max - min);
  const posX = (v) => TEPI + (Pecahan.dari(v).keNumber() - min) * lebarSatuan;
  const labelSetiap = Math.ceil((max - min) / 14);
  const TINGGI = 96;
  const YG = 52;

  const gambar = svg('svg', {
    viewBox: `0 0 ${L} ${TINGGI}`,
    class: 'garis-svg',
    role: 'img',
    'aria-label': `Sebelum: A = ${a}, B = ${b}. Sesudah: A = ${a2}, B = ${b2}.`,
  });
  gambar.append(
    svg('line', { x1: 4, y1: YG, x2: L - 4, y2: YG, class: 'garis-sumbu' }),
    svg('path', { d: `M4 ${YG} l8 -5 v10 z`, class: 'garis-panah-sumbu' }),
    svg('path', { d: `M${L - 4} ${YG} l-8 -5 v10 z`, class: 'garis-panah-sumbu' }),
  );
  for (let v = min; v <= max; v++) {
    const x = posX(v);
    gambar.append(svg('line', { x1: x, y1: YG - 5, x2: x, y2: YG + 5, class: 'garis-tik' }));
    if ((v - min) % labelSetiap === 0 || v === 0) {
      const t = svg('text', { x, y: YG + 22, class: v === 0 ? 'garis-label nol' : 'garis-label' });
      t.textContent = minus(v);
      gambar.append(t);
    }
  }

  // Titik bayangan (posisi lama) + titik yang bergerak
  const titik = (nama, dari, ke, kelas) => {
    const x0 = posX(dari);
    const x1 = posX(ke);
    gambar.append(svg('circle', { cx: x0, cy: YG, r: 5, class: 'banding-bayang' }));
    const g = svg('g', { class: `banding-titik ${kelas}` });
    const label = svg('text', { x: 0, y: -12, class: 'banding-label' });
    label.textContent = nama;
    g.append(svg('circle', { cx: 0, cy: 0, r: 7 }), label);
    g.style.transform = `translate(${x0}px, ${YG}px)`;
    gambar.append(g);
    return () => (g.style.transform = `translate(${x1}px, ${YG}px)`);
  };
  const gerakA = titik('A', a, a2, 'banding-a');
  const gerakB = titik('B', b, b2, 'banding-b');

  const wadah = el('div', { class: 'garis garis-banding' }, gambar,
    el('p', { class: 'petunjuk-kecil' }, '○ abu-abu = posisi sebelum, titik berwarna = posisi sesudah'));
  // Mulai animasi setelah elemen tampil
  requestAnimationFrame(() => requestAnimationFrame(() => {
    gerakA();
    gerakB();
  }));
  return wadah;
}

/** Garis bilangan statis untuk teks hasil/soal, mis. "x >= -2". */
export function garisUntuk(teks) {
  const keadaan = keadaanDariHasil(teks);
  const { min, max } = rentangUntuk(keadaan?.nilai);
  return garisBilangan({ min, max, keadaan, label: `Garis bilangan untuk ${teks}` }).el;
}
