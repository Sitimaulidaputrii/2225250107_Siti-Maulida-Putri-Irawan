import { el } from '../dom.js';
import { DAFTAR_MODUL } from '../modul.js';

export function modul(id) {
  const m = DAFTAR_MODUL.find((x) => x.id === id);
  if (!m) return tidakDitemukan();
  return el('div', { class: 'halaman' },
    el('a', { href: '#/', class: 'kembali' }, '← Beranda'),
    el('h1', {}, `${m.id} · ${m.judul}`),
    el('p', { class: 'redup' }, m.ringkas),
    el('div', { class: 'kartu' }, 'Materi modul ini sedang disiapkan.'),
  );
}

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
