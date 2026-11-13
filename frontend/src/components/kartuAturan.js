/**
 * Kartu Aturan — ringkasan yang dapat dibuka dari layar mana pun (US14).
 */
import { el } from '../dom.js';
import { tampilMatematika } from '../ui/matematika.js';

let dialog = null;

function isiKartu() {
  return [
    el('h2', {}, 'Kartu Aturan'),
    el('h3', {}, 'Kapan tanda dibalik?'),
    el('table', { class: 'tabel' },
      el('thead', {}, el('tr', {}, el('th', {}, 'Kedua ruas …'), el('th', {}, 'Tanda'))),
      el('tbody', {},
        el('tr', {}, el('td', {}, 'ditambah / dikurangi bilangan apa pun'), el('td', {}, 'tetap')),
        el('tr', {}, el('td', {}, 'dikali / dibagi bilangan positif'), el('td', {}, 'tetap')),
        el('tr', { class: 'baris-balik' }, el('td', {}, 'dikali / dibagi bilangan negatif'), el('td', {}, el('strong', {}, '⇄ dibalik'))))),
    el('p', {}, tampilMatematika('-3x <= 6'), '  →  ', tampilMatematika('x >= -2', { dibalik: true })),
    el('h3', {}, 'Garis bilangan'),
    el('ul', {},
      el('li', {}, '○ bulatan terbuka untuk < dan > (batas tidak termasuk)'),
      el('li', {}, '● bulatan tertutup untuk ≤ dan ≥ (batas termasuk)'),
      el('li', {}, 'x > a atau x ≥ a → arsir ke kanan; x < a atau x ≤ a → arsir ke kiri')),
    el('h3', {}, 'Kata kunci soal cerita'),
    el('ul', {},
      el('li', {}, 'paling sedikit, minimal → ≥'),
      el('li', {}, 'paling banyak, maksimal, tidak lebih dari → ≤'),
      el('li', {}, 'lebih dari → >   ·   kurang dari → <')),
  ];
}

export function bukaKartuAturan() {
  if (!dialog) {
    const tutup = el('button', { type: 'button', class: 'tombol', onclick: () => dialog.close() }, 'Tutup');
    dialog = el('dialog', { class: 'kartu-aturan', 'aria-label': 'Kartu Aturan' }, ...isiKartu(), tutup);
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) dialog.close(); // ketuk di luar kartu untuk menutup
    });
    document.body.append(dialog);
  }
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open', '');
}
