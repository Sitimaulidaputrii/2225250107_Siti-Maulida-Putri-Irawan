import { el } from '../dom.js';
import { DAFTAR_MODUL } from '../modul.js';
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

export function beranda() {
  return el('div', { class: 'halaman' },
    el('h1', {}, 'Halo! 👋'),
    el('p', { class: 'redup' }, 'Belajar pertidaksamaan linear satu variabel, satu langkah demi satu langkah.'),
    kartuInstal(),
    el('h2', {}, 'Modul'),
    el('ol', { class: 'daftar-modul' },
      DAFTAR_MODUL.map((m) =>
        el('li', {},
          el('a', { href: `#/modul/${m.id}`, class: m.fokus ? 'modul fokus' : 'modul' },
            el('span', { class: 'modul-id' }, m.id),
            el('span', { class: 'modul-teks' },
              el('span', { class: 'modul-judul' }, m.judul),
              el('span', { class: 'modul-ringkas' }, m.ringkas)),
          ),
        ),
      ),
    ),
    el('p', { class: 'kaki' },
      el('a', { href: '#/tentang' }, 'Tentang aplikasi')),
  );
}
