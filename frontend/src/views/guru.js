/**
 * Dasbor guru (F11):
 *   #/guru            → masuk/daftar, atau daftar kelas + buat kelas
 *   #/guru/kelas/ID   → tabel siswa, distribusi kesalahan, pengaturan kelas, ekspor CSV
 * Dasbor memerlukan internet (data dari server).
 */
import { GalatApi, ambilSesiGuru, panggil, simpanSesiGuru } from '../api.js';
import { el } from '../dom.js';
import { NAMA_KESALAHAN } from '../engine/diagnosis.js';

const kembaliBeranda = () => el('a', { href: '#/', class: 'kembali' }, '← Beranda');

function isian(label, atribut) {
  const input = el('input', { class: 'isian', ...atribut });
  return { input, el: el('label', { class: 'label-isian' }, el('span', {}, label), input) };
}

async function denganSesi(wadah, kerja) {
  const sesi = await ambilSesiGuru();
  if (!sesi?.token) {
    wadah.replaceChildren(...formMasuk(wadah));
    return;
  }
  try {
    await kerja(sesi);
  } catch (e) {
    if (e instanceof GalatApi && e.status === 401) {
      await simpanSesiGuru(null);
      wadah.replaceChildren(...formMasuk(wadah));
    } else {
      wadah.replaceChildren(kembaliBeranda(), el('p', { class: 'umpan umpan-cek' }, e.message));
    }
  }
}

function formMasuk(wadah) {
  let mode = 'masuk';
  const nama = isian('Nama', { autocomplete: 'name' });
  const email = isian('Email', { type: 'email', autocomplete: 'email' });
  const sandi = isian('Kata sandi (min. 8 karakter)', { type: 'password', autocomplete: 'current-password' });
  const pesan = el('p', { class: 'papan-pesan', role: 'status' });
  const tombol = el('button', { type: 'button', class: 'tombol', onclick: kirim }, 'Masuk');
  const ganti = el('button', { type: 'button', class: 'tautan', onclick: () => atur(mode === 'masuk' ? 'daftar' : 'masuk') });

  function atur(m) {
    mode = m;
    nama.el.hidden = m === 'masuk';
    tombol.textContent = m === 'masuk' ? 'Masuk' : 'Daftar';
    ganti.textContent = m === 'masuk' ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk';
    pesan.textContent = '';
  }

  async function kirim() {
    pesan.textContent = 'Menghubungi server…';
    try {
      const isi = { email: email.input.value.trim(), sandi: sandi.input.value };
      if (mode === 'daftar') isi.nama = nama.input.value.trim();
      const r = await panggil(`/auth/guru/${mode}`, { metode: 'POST', isi });
      await simpanSesiGuru({ token: r.token, guru: r.guru });
      wadah.replaceChildren(...(await isiDaftarKelas(wadah)));
    } catch (e) {
      pesan.textContent = e.message;
    }
  }

  atur('masuk');
  return [kembaliBeranda(), el('h1', {}, 'Dasbor Guru'),
    el('section', { class: 'kartu' }, nama.el, email.el, sandi.el, pesan, tombol, ganti)];
}

async function isiDaftarKelas(wadah) {
  const sesi = await ambilSesiGuru();
  const kelas = await panggil('/kelas', { token: sesi.token });
  const namaKelas = isian('Nama kelas baru', { placeholder: 'mis. IX-A' });
  const pesan = el('p', { class: 'papan-pesan', role: 'status' });
  return [
    kembaliBeranda(),
    el('div', { class: 'baris-judul' },
      el('h1', {}, 'Kelas Saya'),
      el('button', { type: 'button', class: 'tautan', onclick: async () => {
        await simpanSesiGuru(null);
        wadah.replaceChildren(...formMasuk(wadah));
      } }, 'Keluar')),
    el('p', { class: 'redup' }, `Masuk sebagai ${sesi.guru.nama}`),
    kelas.length
      ? el('ul', { class: 'daftar-bagian' }, ...kelas.map((k) => el('li', {},
        el('a', { href: `#/guru/kelas/${k.id}`, class: 'bagian' },
          el('span', { class: 'bagian-judul' }, k.nama),
          el('span', { class: 'kode-kelas' }, k.kode),
          el('span', { class: 'alat-ringkas' }, `${k.jumlah_siswa} siswa`)))))
      : el('p', { class: 'redup' }, 'Belum ada kelas.'),
    el('section', { class: 'kartu' },
      namaKelas.el, pesan,
      el('button', { type: 'button', class: 'tombol', onclick: async () => {
        try {
          await panggil('/kelas', { metode: 'POST', isi: { nama: namaKelas.input.value.trim() }, token: sesi.token });
          wadah.replaceChildren(...(await isiDaftarKelas(wadah)));
        } catch (e) {
          pesan.textContent = e.message;
        }
      } }, 'Buat kelas')),
  ];
}

function grafikDistribusi(distribusi) {
  const entri = Object.entries(distribusi).sort((a, b) => b[1] - a[1]);
  if (!entri.length) return el('p', { class: 'redup' }, 'Belum ada data kesalahan.');
  const maks = Math.max(...entri.map(([, n]) => n));
  return el('div', { class: 'grafik', role: 'list' }, ...entri.map(([kode, n]) =>
    el('div', { class: 'grafik-baris', role: 'listitem' },
      el('span', { class: 'grafik-label' }, `${kode} · ${NAMA_KESALAHAN[kode] ?? kode}`),
      el('span', { class: 'grafik-bilah' }, el('span', { class: 'grafik-isi', style: `width:${(n / maks) * 100}%` })),
      el('span', { class: 'grafik-nilai' }, String(n)))));
}

async function unduh(jalur, nama, token) {
  const r = await fetch(`/api${jalur}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) throw new GalatApi(r.status, 'Gagal mengunduh data.');
  const url = URL.createObjectURL(await r.blob());
  const a = el('a', { href: url, download: nama });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function isiDetailKelas(id) {
  const sesi = await ambilSesiGuru();
  const d = await panggil(`/guru/kelas/${id}/ringkasan`, { token: sesi.token });
  const k = d.kelas;

  const sakelar = (kunci, label, ket) => {
    const input = el('input', { type: 'checkbox', checked: !!k.pengaturan[kunci] });
    input.addEventListener('change', async () => {
      k.pengaturan[kunci] = input.checked;
      await panggil(`/kelas/${id}/pengaturan`, { metode: 'PATCH', isi: k.pengaturan, token: sesi.token });
    });
    return el('label', { class: 'sakelar' }, input, el('span', {}, el('strong', {}, label), el('br'), el('span', { class: 'alat-ringkas' }, ket)));
  };

  const pesanUnduh = el('p', { class: 'papan-pesan', role: 'status' });
  const tombolUnduh = (jenis, label) => el('button', { type: 'button', class: 'tombol tombol-kedua', onclick: async () => {
    pesanUnduh.textContent = '';
    try {
      await unduh(`/guru/kelas/${id}/ekspor.csv?jenis=${jenis}`, `${k.nama}-${jenis}.csv`, sesi.token);
    } catch (e) {
      pesanUnduh.textContent = e.message;
    }
  } }, label);

  return [
    el('a', { href: '#/guru', class: 'kembali' }, '← Kelas Saya'),
    el('h1', {}, k.nama),
    el('p', {}, 'Kode kelas untuk siswa: ', el('strong', { class: 'kode-kelas besar' }, k.kode)),
    el('h2', {}, 'Siswa'),
    d.siswa.length
      ? el('div', { class: 'tabel-wadah' }, el('table', { class: 'tabel tabel-data' },
        el('thead', {}, el('tr', {}, ...['Siswa', 'Level', 'Akurasi', 'Jawaban', 'Petunjuk', 'Kesalahan utama'].map((h) => el('th', {}, h)))),
        el('tbody', {}, ...d.siswa.map((s) => el('tr', {},
          el('td', {}, s.nama_panggilan),
          el('td', {}, s.level_tertinggi ? `L${s.level_tertinggi}` : '–'),
          el('td', {}, s.jumlah ? `${Math.round(s.akurasi * 100)}%` : '–'),
          el('td', {}, String(s.jumlah)),
          el('td', {}, String(s.petunjuk)),
          el('td', {}, s.kesalahan_utama ? `${s.kesalahan_utama} ${NAMA_KESALAHAN[s.kesalahan_utama] ?? ''}` : '–'))))))
      : el('p', { class: 'redup' }, `Belum ada siswa. Bagikan kode ${k.kode} kepada siswa (menu Pengaturan → Kelas).`),
    el('h2', {}, 'Distribusi kesalahan kelas'),
    grafikDistribusi(d.distribusi),
    d.skala.jumlah_paas || d.skala.jumlah_leppink
      ? el('section', {}, el('h2', {}, 'Beban kognitif'),
        el('p', {}, `Usaha mental (Paas, 1–9): rata-rata ${d.skala.paas_rata?.toFixed(2) ?? '–'} dari ${d.skala.jumlah_paas} isian.`),
        d.skala.leppink ? el('p', {}, `Leppink (0–10): IL ${d.skala.leppink.IL.toFixed(2)} · EL ${d.skala.leppink.EL.toFixed(2)} · GL ${d.skala.leppink.GL.toFixed(2)}`) : null)
      : null,
    el('h2', {}, 'Pengaturan kelas'),
    el('div', { class: 'kartu' },
      sakelar('promptPenjelasan', 'Prompt penjelasan diri', 'Pertanyaan "Mengapa…?" setelah contoh dan soal kunci (GL04).'),
      sakelar('skalaBeban', 'Instrumen beban kognitif', 'Skala usaha mental setelah latihan/kuis dan kuesioner di akhir M4 & M6 (untuk penelitian).')),
    el('h2', {}, 'Ekspor data (anonim)'),
    el('div', { class: 'baris-tombol' }, tombolUnduh('percobaan', 'Jawaban siswa (CSV)'), tombolUnduh('skala', 'Beban kognitif (CSV)')),
    pesanUnduh,
  ];
}

export function dasborGuru(bagian, id) {
  const wadah = el('div', { class: 'halaman halaman-lebar' }, el('p', { class: 'redup' }, 'Memuat…'));
  denganSesi(wadah, async () => {
    wadah.replaceChildren(...(bagian === 'kelas' && id ? await isiDetailKelas(id) : await isiDaftarKelas(wadah)));
  });
  return wadah;
}
