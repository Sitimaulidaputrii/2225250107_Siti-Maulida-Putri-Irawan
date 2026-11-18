/**
 * Contoh berpasangan (desain D07): dua soal yang strukturnya sama ditampilkan berdampingan
 * dan langkahnya dibuka BERSAMAAN, agar siswa melihat satu-satunya perbedaan
 * (mis. koefisien positif vs negatif → tanda tetap vs dibalik).
 */
import { el } from '../dom.js';
import { formatHasil, langkahPenyelesaian, selesaikan } from '../engine/penyelesai.js';
import { tampilMatematika } from '../ui/matematika.js';
import { garisUntuk } from './garisBilangan.js';
import { barisLangkah } from './langkahDemiLangkah.js';

/**
 * @param {{label:string, soal:string, langkah?:Array}} kiri
 * @param {{label:string, soal:string, langkah?:Array}} kanan
 */
export function contohBerpasangan({ kiri, kanan, onSelesai = () => {} }) {
  const sisi = [kiri, kanan].map((s) => ({ ...s, langkah: s.langkah ?? langkahPenyelesaian(s.soal) }));
  const total = Math.max(...sisi.map((s) => s.langkah.length));
  let terbuka = 1;
  let sudah = false;

  const kolom = sisi.map((s) => {
    const daftar = el('ol', { class: 'daftar-langkah' });
    const akhir = el('div', {});
    return { s, daftar, akhir, el: el('section', { class: 'pasangan-kolom' }, el('h3', {}, s.label), daftar, akhir) };
  });
  const status = el('p', { class: 'langkah-status' });
  const kembali = el('button', { type: 'button', class: 'tombol tombol-kedua', onclick: () => ke(terbuka - 1) }, '← Kembali');
  const lanjut = el('button', { type: 'button', class: 'tombol', onclick: () => ke(terbuka + 1) }, 'Langkah berikutnya →');

  function ke(n) {
    terbuka = Math.max(1, Math.min(total, n));
    const habis = terbuka >= total;
    for (const k of kolom) {
      k.daftar.replaceChildren(...k.s.langkah.slice(0, terbuka).map(barisLangkah));
      k.daftar.lastElementChild?.classList.add('langkah-baru');
      k.akhir.replaceChildren();
      if (habis) {
        const h = formatHasil(selesaikan(k.s.soal));
        k.akhir.append(el('p', { class: 'langkah-hasil' }, 'Hasil: ', tampilMatematika(h)), garisUntuk(h));
      }
    }
    status.textContent = `Langkah ${terbuka} dari ${total}`;
    kembali.disabled = terbuka <= 1;
    lanjut.hidden = habis;
    if (habis && !sudah) {
      sudah = true;
      onSelesai();
    }
  }

  ke(1);
  return el('div', { class: 'pasangan' },
    el('div', { class: 'pasangan-grid' }, ...kolom.map((k) => k.el)),
    el('div', { class: 'langkah-navigasi' }, el('span', {}), status),
    el('div', { class: 'baris-tombol' }, kembali, lanjut));
}
