/**
 * Contoh bertahap: langkah dibuka satu per ketukan (D04 segmenting),
 * langkah sebelumnya tetap terlihat (mengurangi beban memori kerja),
 * penjelasan menempel tepat di bawah baris aljabarnya (D11 spatial contiguity).
 */
import { el } from '../dom.js';
import { Pecahan } from '../engine/pecahan.js';
import { parsePertidaksamaan } from '../engine/parser.js';
import { formatHasil, memenuhi, selesaikan } from '../engine/penyelesai.js';
import { tampilMatematika, teksRapi } from '../ui/matematika.js';
import { garisUntuk } from './garisBilangan.js';

/** Satu baris langkah (dipakai juga oleh layar latihan). */
export function barisLangkah(langkah, indeks) {
  const isi = [el('div', { class: 'langkah-mat' }, tampilMatematika(langkah.ekspresi, { dibalik: langkah.dibalik, besar: true }))];
  if (indeks > 0 && langkah.penjelasan) {
    isi.push(el('p', { class: 'langkah-penjelasan' }, teksRapi(langkah.penjelasan)));
  }
  if (langkah.dibalik) isi.push(el('span', { class: 'lencana-balik' }, '⇄ tanda dibalik'));
  return el('li', { class: langkah.dibalik ? 'langkah langkah-balik' : 'langkah' }, ...isi);
}

/** Memilih nilai uji yang mudah: 0 jika memenuhi, selain itu bilangan bulat terdekat di dalam himpunan. */
export function nilaiUji(soal) {
  if (memenuhi(soal, 0)) return 0;
  const h = selesaikan(soal);
  if (h.jenis !== 'batas') return 0;
  return h.tanda.startsWith('>') ? h.nilai.bawah() + 1 : h.nilai.atas() - 1;
}

/** Mengganti x dengan nilai, mis. ("-3x + 5", 0) → "-3(0) + 5". */
function substitusi(ruas, t) {
  const v = t < 0 ? `(${t})` : String(t);
  return ruas.replace(/(\d)\s*x/g, `$1(${t})`).replace(/x/g, v);
}

/** Baris "Cek dengan x = 0: −3(0) + 5 = 5 ≤ 11 ✔" */
export function cekSubstitusi(soal) {
  const t = nilaiUji(soal);
  const { kiri, kanan, op } = parsePertidaksamaan(soal);
  const teks = String(soal).replace(/≤/g, '<=').replace(/≥/g, '>=');
  const [ruasKiri, ruasKanan] = teks.split(/<=|>=|<|>|=/);
  const nk = kiri.nilaiPada(new Pecahan(t));
  const nn = kanan.nilaiPada(new Pecahan(t));
  const ringkas = (ruas, n) => (/x/.test(ruas) ? `${substitusi(ruas.trim(), t)} = ${n}` : `${n}`);
  return el('div', { class: 'cek' },
    el('p', { class: 'cek-judul' }, `Cek dengan x = ${teksRapi(String(t))} (bilangan dari himpunan penyelesaian):`),
    el('p', {}, teksRapi(`Ruas kiri: ${ringkas(ruasKiri, nk)}`)),
    el('p', {}, teksRapi(`Ruas kanan: ${ringkas(ruasKanan, nn)}`)),
    el('p', { class: 'cek-hasil' }, tampilMatematika(`${nk} ${op} ${nn}`), ' benar ✔'));
}

/**
 * @param {object} p
 * @param {Array} p.langkah       dari langkahPenyelesaian() atau bank soal
 * @param {string} [p.soal]       teks soal, untuk garis bilangan & cek di akhir
 * @param {() => void} [p.onSelesai]
 */
export function langkahDemiLangkah({ langkah, soal = null, onSelesai = () => {} }) {
  let terbuka = 1;
  let sudahSelesai = false;

  const daftar = el('ol', { class: 'daftar-langkah', 'aria-live': 'polite' });
  const akhir = el('div', { class: 'langkah-akhir' });
  const titik = el('div', { class: 'titik-kemajuan', 'aria-hidden': 'true' });
  const status = el('p', { class: 'langkah-status' });
  const tombolKembali = el('button', { type: 'button', class: 'tombol tombol-kedua', onclick: () => ke(terbuka - 1) }, '← Kembali');
  const tombolLanjut = el('button', { type: 'button', class: 'tombol', onclick: () => ke(terbuka + 1) }, 'Langkah berikutnya →');
  const tombolUlang = el('button', { type: 'button', class: 'tautan', onclick: () => ke(1) }, '↺ Ulangi dari awal');

  function ke(n) {
    terbuka = Math.max(1, Math.min(langkah.length, n));
    render();
  }

  function render() {
    daftar.replaceChildren(...langkah.slice(0, terbuka).map(barisLangkah));
    daftar.lastElementChild?.classList.add('langkah-baru');
    titik.replaceChildren(...langkah.map((_, i) => el('span', { class: i < terbuka ? 'titik isi' : 'titik' })));
    status.textContent = `Langkah ${terbuka} dari ${langkah.length}`;
    tombolKembali.disabled = terbuka <= 1;
    const habis = terbuka >= langkah.length;
    tombolLanjut.hidden = habis;
    tombolUlang.hidden = !habis;
    akhir.replaceChildren();
    if (habis && soal) {
      const h = selesaikan(soal);
      akhir.append(el('p', { class: 'langkah-hasil' }, 'Himpunan penyelesaian: ', tampilMatematika(formatHasil(h))));
      if (h.jenis === 'batas') akhir.append(garisUntuk(formatHasil(h)), cekSubstitusi(soal));
    }
    if (habis && !sudahSelesai) {
      sudahSelesai = true;
      onSelesai();
    }
  }

  render();
  return el('div', { class: 'contoh-bertahap' },
    daftar, akhir,
    el('div', { class: 'langkah-navigasi' }, titik, status),
    el('div', { class: 'baris-tombol' }, tombolKembali, tombolLanjut),
    tombolUlang);
}
