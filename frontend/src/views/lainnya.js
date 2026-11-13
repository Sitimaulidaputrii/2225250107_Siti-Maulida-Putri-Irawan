import { el } from '../dom.js';

export function tentang() {
  const status = el('span', {}, 'memeriksa…');
  fetch('/api/kesehatan')
    .then((r) => (r.ok ? r.json() : Promise.reject()))
    .then((d) => (status.textContent = `terhubung (v${d.versi})`))
    .catch(() => (status.textContent = 'tidak terhubung — aplikasi tetap bisa dipakai offline'));

  return el('div', { class: 'halaman' },
    el('a', { href: '#/', class: 'kembali' }, '← Beranda'),
    el('h1', {}, 'Tentang'),
    el('p', {}, 'TandaTepat membantu siswa SMP memahami pertidaksamaan linear satu variabel, ',
      'terutama kapan tanda pertidaksamaan harus dibalik.'),
    el('p', {}, 'Versi aplikasi: ', el('strong', {}, __VERSI_APLIKASI__)),
    el('p', {}, 'Server: ', status),
  );
}

export function tidakDitemukan() {
  return el('div', { class: 'halaman' },
    el('h1', {}, 'Halaman tidak ditemukan'),
    el('a', { href: '#/' }, 'Kembali ke beranda'),
  );
}
