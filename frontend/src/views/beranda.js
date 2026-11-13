import { el } from '../dom.js';
import { DAFTAR_MODUL } from '../modul.js';
import { ambilProgres } from '../penyimpanan.js';
import {
  bisaPromptInstal,
  mintaInstal,
  perangkatIOS,
  saatStatusInstalBerubah,
  sudahTerpasang,
} from '../instal.js';

function kartuInstal() {
  const wadah = el('section', { class: 'kartu kartu-instal', 'aria-live': 'polite' });

  function perbarui() {
    if (sudahTerpasang()) {
      wadah.hidden = true;
      return;
    }
    if (bisaPromptInstal()) {
      wadah.hidden = false;
      wadah.replaceChildren(
        el('p', {}, 'Pasang TandaTepat di perangkatmu agar bisa dibuka seperti aplikasi, juga tanpa internet.'),
        el('button', { class: 'tombol', onclick: () => mintaInstal() }, 'Instal Aplikasi'),
      );
    } else if (perangkatIOS()) {
      wadah.hidden = false;
      wadah.replaceChildren(
        el('p', {}, 'Untuk memasang di iPhone/iPad: ketuk ikon ', el('strong', {}, 'Bagikan'),
          ' di Safari, lalu pilih ', el('strong', {}, 'Tambahkan ke Layar Utama'), '.'),
      );
    } else {
      wadah.hidden = true;
    }
  }

  perbarui();
  saatStatusInstalBerubah(perbarui);
  return wadah;
}

/** 'selesai' | 'sedang' | 'belum' */
function statusModul(p) {
  if (p.total > 0 && p.selesai.length >= p.total) return 'selesai';
  return p.selesai.length > 0 ? 'sedang' : 'belum';
}

const TANDA_STATUS = { selesai: '✔', sedang: '◐', belum: '' };
const ARIA_STATUS = { selesai: 'selesai', sedang: 'sedang dipelajari', belum: 'belum dimulai' };

export function beranda() {
  const lanjutkan = el('div', {});
  const daftar = el('ol', { class: 'daftar-modul' });

  function render(progres) {
    daftar.replaceChildren(...DAFTAR_MODUL.map((m, i) => {
      const status = m.tersedia ? statusModul(progres[i]) : 'belum';
      return el('li', {},
        el('a', {
          href: `#/modul/${m.id}`,
          class: ['modul', m.fokus ? 'fokus' : '', m.tersedia ? '' : 'segera'].join(' ').trim(),
          'aria-label': `${m.id} ${m.judul}, ${m.tersedia ? ARIA_STATUS[status] : 'segera hadir'}`,
        },
        el('span', { class: 'modul-id' }, m.id),
        el('span', { class: 'modul-teks' },
          el('span', { class: 'modul-judul' }, m.judul),
          el('span', { class: 'modul-ringkas' }, m.tersedia ? m.ringkas : `${m.ringkas} · segera hadir`)),
        el('span', { class: `modul-status ${status}`, 'aria-hidden': 'true' }, TANDA_STATUS[status])));
    }));

    const berikut = DAFTAR_MODUL.find((m, i) => m.tersedia && statusModul(progres[i]) !== 'selesai');
    lanjutkan.replaceChildren(berikut
      ? el('section', { class: 'kartu kartu-lanjut' },
        el('p', { class: 'redup' }, progres.some((p) => p.selesai.length) ? 'Lanjutkan belajar' : 'Mulai belajar'),
        el('p', { class: 'kartu-lanjut-judul' }, `${berikut.id} · ${berikut.judul}`),
        el('a', { href: `#/modul/${berikut.id}`, class: 'tombol' }, 'Lanjutkan →'))
      : el('section', { class: 'kartu' }, el('p', {}, 'Semua modul yang tersedia sudah selesai. 🎉')));
  }

  render(DAFTAR_MODUL.map(() => ({ selesai: [], total: 0 })));
  Promise.all(DAFTAR_MODUL.map((m) => ambilProgres(m.id))).then(render);

  return el('div', { class: 'halaman' },
    el('h1', {}, 'Halo! 👋'),
    el('p', { class: 'redup' }, 'Belajar pertidaksamaan linear satu variabel, satu langkah demi satu langkah.'),
    kartuInstal(),
    lanjutkan,
    el('h2', {}, 'Modul'),
    daftar,
    el('p', { class: 'kaki' }, el('a', { href: '#/tentang' }, 'Tentang aplikasi')),
  );
}
