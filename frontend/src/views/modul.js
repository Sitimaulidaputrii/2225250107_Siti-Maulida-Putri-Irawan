/**
 * Pemutar modul berbasis konten JSON (public/konten/modul-Mx.json).
 *   #/modul/M3     → ringkasan modul + daftar bagian
 *   #/modul/M3/2   → membuka bagian ke-2
 * Jenis bagian: materi | contoh | latihan | kuis
 */
import { latihan } from '../components/latihan.js';
import { langkahDemiLangkah } from '../components/langkahDemiLangkah.js';
import { renderButir, teksCampur, visual } from '../components/soal.js';
import { el } from '../dom.js';
import { statusAwal } from '../engine/adaptif.js';
import { langkahPenyelesaian } from '../engine/penyelesai.js';
import { DAFTAR_MODUL } from '../modul.js';
import { ambilProgres, simpanProgres } from '../penyimpanan.js';

const IKON_BAGIAN = { materi: '📘', contoh: '🧩', latihan: '✏️', kuis: '✅' };

const cacheKonten = new Map();
export async function muatKonten(id) {
  if (!cacheKonten.has(id)) {
    cacheKonten.set(id, fetch(`/konten/modul-${id}.json`).then((r) => (r.ok ? r.json() : null)).catch(() => null));
  }
  return cacheKonten.get(id);
}

function kembali(href, teks) {
  return el('a', { href, class: 'kembali' }, `← ${teks}`);
}

async function tandaiSelesai(id, indeks, total) {
  const p = await ambilProgres(id);
  if (!p.selesai.includes(indeks)) p.selesai.push(indeks);
  p.total = total;
  await simpanProgres(id, p);
  return p;
}

// ------------------------------------------------------------------ halaman

export function modul(id, indeksTeks) {
  const info = DAFTAR_MODUL.find((m) => m.id === id);
  const wadah = el('div', { class: 'halaman' }, el('p', { class: 'redup' }, 'Memuat…'));
  if (!info) {
    wadah.replaceChildren(el('h1', {}, 'Modul tidak ditemukan'), kembali('#/', 'Beranda'));
    return wadah;
  }
  Promise.all([muatKonten(id), ambilProgres(id)]).then(([konten, progres]) => {
    if (!konten) {
      wadah.replaceChildren(kembali('#/', 'Beranda'), el('h1', {}, `${info.id} · ${info.judul}`),
        el('div', { class: 'kartu' }, 'Materi modul ini sedang disiapkan.'));
      return;
    }
    if (progres.total !== konten.bagian.length) {
      progres.total = konten.bagian.length;
      simpanProgres(id, progres);
    }
    const indeks = indeksTeks === undefined ? null : Number(indeksTeks);
    if (indeks === null || !konten.bagian[indeks]) wadah.replaceChildren(...ringkasan(konten, progres));
    else wadah.replaceChildren(...halamanBagian(konten, indeks, progres));
  });
  return wadah;
}

function ringkasan(konten, progres) {
  const berikut = konten.bagian.findIndex((_, i) => !progres.selesai.includes(i));
  const indeksModul = DAFTAR_MODUL.findIndex((m) => m.id === konten.id);
  const modulBerikut = DAFTAR_MODUL[indeksModul + 1];
  return [
    kembali('#/', 'Beranda'),
    el('h1', {}, `${konten.id} · ${konten.judul}`),
    el('p', { class: 'redup' }, konten.tujuan),
    el('ol', { class: 'daftar-bagian' },
      ...konten.bagian.map((b, i) => {
        const selesai = progres.selesai.includes(i);
        return el('li', {},
          el('a', { href: `#/modul/${konten.id}/${i}`, class: selesai ? 'bagian selesai' : 'bagian' },
            el('span', { class: 'bagian-ikon', 'aria-hidden': 'true' }, IKON_BAGIAN[b.jenis]),
            el('span', { class: 'bagian-judul' }, b.judul),
            el('span', { class: 'bagian-status' }, selesai ? '✔' : '')));
      })),
    berikut >= 0
      ? el('a', { href: `#/modul/${konten.id}/${berikut}`, class: 'tombol' }, progres.selesai.length ? 'Lanjutkan →' : 'Mulai →')
      : el('div', { class: 'kartu' },
        el('p', {}, 'Modul ini sudah selesai. 🎉'),
        modulBerikut ? el('a', { href: `#/modul/${modulBerikut.id}`, class: 'tombol' }, `Lanjut ke ${modulBerikut.id} →`) : null),
  ];
}

function halamanBagian(konten, indeks, progres) {
  const bagian = konten.bagian[indeks];
  const total = konten.bagian.length;
  const akhir = el('div', { class: 'bagian-akhir', hidden: true });

  const selesai = async () => {
    await tandaiSelesai(konten.id, indeks, total);
    const berikut = indeks + 1 < total ? `#/modul/${konten.id}/${indeks + 1}` : `#/modul/${konten.id}`;
    akhir.hidden = false;
    akhir.replaceChildren(el('a', { href: berikut, class: 'tombol' }, indeks + 1 < total ? `Lanjut: ${konten.bagian[indeks + 1].judul} →` : 'Selesai — kembali ke ringkasan modul'));
  };

  const pemutar = {
    materi: () => pemutarMateri(bagian, selesai),
    contoh: () => pemutarContoh(bagian, selesai),
    latihan: () => pemutarLatihan(konten, indeks, bagian, progres, selesai),
    kuis: () => pemutarKuis(konten, indeks, bagian, selesai),
  }[bagian.jenis];

  return [
    kembali(`#/modul/${konten.id}`, `${konten.id} ${konten.judul}`),
    el('p', { class: 'bagian-lokasi' }, `Bagian ${indeks + 1} dari ${total}`),
    el('h1', {}, bagian.judul),
    pemutar(),
    akhir,
  ];
}

// ------------------------------------------------------------------ pemutar

function segmenMateri(s) {
  const isi = [];
  if (s.judul) isi.push(el('h2', {}, s.judul));
  for (const p of [].concat(s.teks ?? [])) isi.push(el('p', {}, ...teksCampur(p)));
  if (s.visual) isi.push(visual(s.visual));
  if (s.aktivitas) isi.push(el('div', { class: 'aktivitas' }, el('p', { class: 'aktivitas-label' }, 'Coba!'), renderButir(s.aktivitas)));
  return el('section', { class: 'segmen' }, ...isi);
}

/** Satu segmen per layar (≤ 4 kalimat + 1 visual). */
function pemutarMateri(bagian, onSelesai) {
  let i = 0;
  let sudah = false;
  const n = bagian.segmen.length;
  const isi = el('div', { class: 'segmen-wadah', 'aria-live': 'polite' });
  const titik = el('div', { class: 'titik-kemajuan', 'aria-hidden': 'true' });
  const posisi = el('p', { class: 'langkah-status' });
  const mundur = el('button', { type: 'button', class: 'tombol tombol-kedua', onclick: () => ke(i - 1) }, '← Kembali');
  const maju = el('button', { type: 'button', class: 'tombol', onclick: () => ke(i + 1) }, 'Berikutnya →');

  function ke(j) {
    i = Math.max(0, Math.min(n - 1, j));
    isi.replaceChildren(segmenMateri(bagian.segmen[i]));
    titik.replaceChildren(...bagian.segmen.map((_, k) => el('span', { class: k <= i ? 'titik isi' : 'titik' })));
    posisi.textContent = `${i + 1} / ${n}`;
    mundur.disabled = i === 0;
    maju.hidden = i === n - 1;
    if (i === n - 1 && !sudah) {
      sudah = true;
      onSelesai();
    }
    window.scrollTo(0, 0);
  }
  ke(0);
  return el('div', {}, isi, el('div', { class: 'langkah-navigasi' }, titik, posisi), el('div', { class: 'baris-tombol' }, mundur, maju));
}

function pemutarContoh(bagian, onSelesai) {
  const langkah = bagian.langkah ?? langkahPenyelesaian(bagian.soal);
  const wadahPrompt = el('div', {});
  const isi = [];
  if (bagian.pengantar) isi.push(el('p', {}, ...teksCampur(bagian.pengantar)));
  isi.push(langkahDemiLangkah({
    langkah,
    soal: bagian.soal,
    onSelesai: () => {
      // Prompt penjelasan diri (GL04) muncul setelah semua langkah dibuka
      if (bagian.prompt) {
        wadahPrompt.replaceChildren(el('div', { class: 'aktivitas' },
          el('p', { class: 'aktivitas-label' }, 'Jelaskan!'),
          renderButir({ tipe: 'pilihan', ...bagian.prompt }, onSelesai)));
      } else onSelesai();
    },
  }));
  return el('div', {}, ...isi, wadahPrompt);
}

function pemutarLatihan(konten, indeks, bagian, progres, onSelesai) {
  const indeksContoh = konten.bagian.findIndex((b) => b.jenis === 'contoh');
  const status = progres.latihan[indeks] ?? statusAwal(bagian.level);
  const simpanStatus = async (s) => {
    const p = await ambilProgres(konten.id);
    p.latihan[indeks] = s;
    await simpanProgres(konten.id, p);
  };
  let mulai = status;
  // Latihan yang sudah tuntas boleh diulang dari fase mandiri
  if (status.level !== bagian.level) mulai = { ...statusAwal(bagian.level), fase: 'mandiri' };
  return latihan({
    status: mulai,
    pengaturan: bagian,
    lewatiContoh: indeksContoh >= 0 && progres.selesai.includes(indeksContoh),
    onSimpan: simpanStatus,
    onTuntas: onSelesai,
    idModul: konten.id,
  });
}

function pemutarKuis(konten, indeks, bagian, onSelesai) {
  const wadah = el('div', { class: 'kuis' });
  const ambang = bagian.lulus ?? null;

  function jalankan(daftarButir, putaran) {
    let i = 0;
    const hasil = [];
    const tampil = () => {
      const item = daftarButir[i];
      const lanjut = el('button', { type: 'button', class: 'tombol', hidden: true, onclick: () => {
        i++;
        if (i < daftarButir.length) tampil();
        else akhiri(daftarButir, hasil, putaran);
      } }, i + 1 < daftarButir.length ? 'Lanjut →' : 'Lihat hasil');
      const butir = renderButir(item, ({ benarPertama, kode }) => {
        hasil.push({ item, benar: benarPertama, kode });
        lanjut.hidden = false;
      });
      wadah.replaceChildren(
        el('div', { class: 'langkah-navigasi' },
          el('div', { class: 'titik-kemajuan', 'aria-hidden': 'true' }, ...daftarButir.map((_, k) => el('span', { class: k <= i ? 'titik isi' : 'titik' }))),
          el('p', { class: 'langkah-status' }, `Soal ${i + 1} dari ${daftarButir.length}`)),
        butir, lanjut);
      window.scrollTo(0, 0);
    };
    tampil();
  }

  async function akhiri(daftarButir, hasil, putaran) {
    const benar = hasil.filter((h) => h.benar).length;
    const skor = benar / daftarButir.length;
    const salah = hasil.filter((h) => !h.benar).map((h) => h.item);
    const p = await ambilProgres(konten.id);
    p.kuis[indeks] = { skor: Math.round(skor * 100), putaran, waktu: new Date().toISOString() };
    await simpanProgres(konten.id, p);

    const isi = [el('div', { class: 'kartu skor' },
      el('p', { class: 'skor-angka' }, `${benar} / ${daftarButir.length}`),
      el('p', {}, skor === 1 ? 'Sempurna! 🎉' : skor >= (ambang ?? 0.75) ? 'Bagus! 🙂' : 'Tidak apa-apa, kita perkuat dulu ya.'))];

    const perluRemedial = ambang !== null && skor < ambang && putaran === 1 && bagian.remedial;
    if (perluRemedial) {
      isi.push(el('h2', {}, 'Kartu Ringkas'),
        ...bagian.remedial.map(segmenMateri),
        el('button', { type: 'button', class: 'tombol', onclick: () => jalankan(salah, 2) }, `Coba lagi ${salah.length} soal yang belum tepat`),
        el('button', { type: 'button', class: 'tautan', onclick: () => onSelesai() }, 'Lewati dulu'));
    } else {
      onSelesai();
      if (salah.length && putaran === 1 && !ambang) {
        isi.push(el('button', { type: 'button', class: 'tombol tombol-kedua', onclick: () => jalankan(salah, 2) }, `Ulangi ${salah.length} soal yang belum tepat`));
      }
    }
    wadah.replaceChildren(...isi);
  }

  jalankan(bagian.soal, 1);
  return wadah;
}
