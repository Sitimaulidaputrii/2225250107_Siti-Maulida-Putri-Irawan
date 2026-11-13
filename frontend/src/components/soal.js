/**
 * Butir soal untuk kuis & aktivitas materi. Jenis (`tipe`):
 *   pilihan    — pilihan ganda
 *   isian      — jawaban angka (papan angka)
 *   memenuhi   — "Apakah x = 3 memenuhi …?" (kunci dihitung mesin)
 *   jawab      — selesaikan pertidaksamaan (papan tanda + diagnosis E1–E5)
 *   garis      — gambar himpunan penyelesaian di garis bilangan (diagnosis E3/E5/E6)
 *   bandingkan — eksplorasi: "3 < 5. Jika kedua ruas ditambah 4, tandanya?" (kunci dihitung mesin)
 *
 * Setiap butir boleh dicoba 2 kali. Skor memakai percobaan pertama.
 * Setelah selesai, `onSelesai({ benarPertama, kode })` dipanggil.
 */
import { el } from '../dom.js';
import { diagnosisGaris, diagnosisJawaban } from '../engine/diagnosis.js';
import { Pecahan } from '../engine/pecahan.js';
import { parsePertidaksamaan } from '../engine/parser.js';
import { langkahPenyelesaian, memenuhi } from '../engine/penyelesai.js';
import { tampilMatematika, teksRapi } from '../ui/matematika.js';
import { garisBilangan, garisUntuk, keadaanDariHasil, rentangUntuk } from './garisBilangan.js';
import { barisLangkah } from './langkahDemiLangkah.js';
import { papanTanda } from './papanTanda.js';

export const MAKS_PERCOBAAN = 2;

/**
 * Mengubah teks menjadi campuran teks & matematika:
 * "$…$" → ekspresi matematika, "**…**" → tebal. Mis. "Selesaikan $2x > 6$ **sekarang**."
 */
export function teksCampur(teks) {
  return String(teks).split(/\$([^$]+)\$/).flatMap((b, i) => {
    if (i % 2 === 1) return [tampilMatematika(b)];
    return b.split(/\*\*([^*]+)\*\*/).map((t, j) => (j % 2 === 1 ? el('strong', {}, teksRapi(t)) : teksRapi(t)));
  });
}

function kotakUmpan() {
  return el('div', { class: 'umpan', role: 'status', 'aria-live': 'polite', hidden: true });
}

function tampilkanUmpan(kotak, { benar, pesan, tambahan = [] }) {
  kotak.hidden = false;
  kotak.className = benar ? 'umpan umpan-benar' : 'umpan umpan-cek';
  kotak.replaceChildren(el('p', { class: 'umpan-judul' }, benar ? 'Tepat! 🙂' : 'Belum tepat'), ...(pesan ? [el('p', {}, ...teksCampur(pesan))] : []), ...tambahan);
}

/** Kerangka percobaan bersama: hitung percobaan, umpan balik, dan penyelesaian butir. */
function pengelola(item, onSelesai, kotak) {
  let percobaan = 0;
  let benarPertama = null;
  let kodePertama = null;
  let selesai = false;
  return {
    get selesai() {
      return selesai;
    },
    /** Mengembalikan true jika butir sudah selesai (benar atau percobaan habis). */
    nilai({ benar, kode = null, pesan, pembahasan = [] }) {
      if (selesai) return true;
      percobaan++;
      if (benarPertama === null) {
        benarPertama = benar;
        kodePertama = kode;
      }
      selesai = benar || percobaan >= MAKS_PERCOBAAN;
      const tambahan = [];
      if (!benar && !selesai) tambahan.push(el('p', { class: 'umpan-ajak' }, 'Coba sekali lagi.'));
      if (selesai && item.pembahasan) tambahan.push(el('p', { class: 'pembahasan' }, ...teksCampur(item.pembahasan)));
      if (selesai) tambahan.push(...pembahasan);
      tampilkanUmpan(kotak, { benar, pesan, tambahan });
      if (selesai) onSelesai({ benarPertama, kode: kodePertama });
      return selesai;
    },
  };
}

function pilihanTombol(opsi, { onPilih, konten = (o) => teksCampur(o) }) {
  const tombol = opsi.map((o, i) =>
    el('button', { type: 'button', class: 'opsi', onclick: () => onPilih(i, tombol[i]) }, ...[].concat(konten(o))));
  return { el: el('div', { class: 'daftar-opsi' }, ...tombol), tombol };
}

// ------------------------------------------------------------------- jenis butir

function butirPilihan(item, onSelesai) {
  const kotak = kotakUmpan();
  const p = pengelola(item, onSelesai, kotak);
  const { el: daftar, tombol } = pilihanTombol(item.opsi, {
    onPilih(i, b) {
      if (p.selesai) return;
      const benar = i === item.benar;
      b.classList.add(benar ? 'opsi-benar' : 'opsi-salah');
      b.disabled = true;
      const selesai = p.nilai({ benar, pesan: item.umpan?.[i] });
      if (selesai) {
        tombol.forEach((t) => (t.disabled = true));
        tombol[item.benar].classList.add('opsi-benar');
      }
    },
  });
  return el('div', { class: 'butir' },
    el('p', { class: 'butir-tanya' }, ...teksCampur(item.pertanyaan)),
    item.visual ? visual(item.visual) : null,
    daftar, kotak);
}

function butirIsian(item, onSelesai) {
  const kotak = kotakUmpan();
  const p = pengelola(item, onSelesai, kotak);
  const kunci = Pecahan.dari(item.jawaban);
  const papan = papanTanda({
    perluTanda: false,
    awalan: item.awalan ?? '',
    onKirim({ nilai }) {
      const benar = nilai.sama(kunci);
      if (p.nilai({ benar, pesan: benar ? null : item.umpanSalah })) papan.nonaktifkan();
      else papan.reset();
    },
  });
  return el('div', { class: 'butir' }, el('p', { class: 'butir-tanya' }, ...teksCampur(item.pertanyaan)), papan.el, kotak);
}

function butirMemenuhi(item, onSelesai) {
  const kotak = kotakUmpan();
  const p = pengelola(item, onSelesai, kotak);
  const kunci = memenuhi(item.soal, item.nilai);
  const { kiri, kanan, op } = parsePertidaksamaan(item.soal);
  const x = Pecahan.dari(item.nilai);
  const nk = kiri.nilaiPada(x);
  const nn = kanan.nilaiPada(x);
  const penjelasan = el('p', { class: 'pembahasan' },
    `Ganti x dengan ${teksRapi(String(item.nilai))}: ruas kiri = ${teksRapi(String(nk))}, ruas kanan = ${teksRapi(String(nn))}. `,
    tampilMatematika(`${nk} ${op} ${nn}`), kunci ? ' benar, jadi memenuhi.' : ' salah, jadi tidak memenuhi.');
  const { el: daftar, tombol } = pilihanTombol(['Ya, memenuhi', 'Tidak memenuhi'], {
    onPilih(i, b) {
      if (p.selesai) return;
      const benar = (i === 0) === kunci;
      b.classList.add(benar ? 'opsi-benar' : 'opsi-salah');
      b.disabled = true;
      if (p.nilai({ benar, pembahasan: [penjelasan] })) tombol.forEach((t) => (t.disabled = true));
    },
  });
  return el('div', { class: 'butir' },
    el('p', { class: 'butir-tanya' }, `Apakah x = ${teksRapi(String(item.nilai))} memenuhi `, tampilMatematika(item.soal), '?'),
    daftar, kotak);
}

function butirJawab(item, onSelesai) {
  const kotak = kotakUmpan();
  const p = pengelola(item, onSelesai, kotak);
  const langkah = item.langkah ?? langkahPenyelesaian(item.soal);
  const pembahasan = el('details', { class: 'pembahasan-langkah' },
    el('summary', {}, 'Lihat langkah penyelesaian'),
    el('ol', { class: 'daftar-langkah' }, ...langkah.map(barisLangkah)));
  const papan = papanTanda({
    onKirim(jawaban) {
      const d = diagnosisJawaban(item.soal, jawaban, { salahUmum: item.salah_umum ?? [] });
      if (p.nilai({ benar: d.benar, kode: d.kode, pesan: d.benar ? null : d.pesan, pembahasan: [pembahasan] })) {
        papan.nonaktifkan();
      }
    },
  });
  return el('div', { class: 'butir' },
    el('p', { class: 'butir-tanya' }, item.pertanyaan ? teksCampur(item.pertanyaan) : 'Selesaikan:'),
    el('div', { class: 'soal-besar' }, tampilMatematika(item.soal, { besar: true })),
    papan.el, kotak);
}

function butirGaris(item, onSelesai) {
  const kotak = kotakUmpan();
  const p = pengelola(item, onSelesai, kotak);
  const kunci = keadaanDariHasil(item.soal);
  const { min, max } = rentangUntuk(kunci?.nilai);
  const garis = garisBilangan({ min, max, interaktif: true, label: `Gambarkan ${item.soal}` });
  const tombol = el('button', {
    type: 'button',
    class: 'tombol',
    onclick() {
      const k = garis.ambil();
      if (k.nilai === null || !k.arah) {
        tampilkanUmpan(kotak, { benar: false, pesan: 'Taruh titik dan pilih arah arsiran dulu.' });
        return;
      }
      const d = diagnosisGaris(item.soal, k);
      const contoh = el('div', { class: 'pembahasan' }, el('p', {}, 'Gambar yang benar:'), garisUntuk(item.soal));
      if (p.nilai({ benar: d.benar, kode: d.kode, pesan: d.benar ? null : d.pesan, pembahasan: d.benar ? [] : [contoh] })) {
        tombol.disabled = true;
      }
    },
  }, 'Periksa');
  return el('div', { class: 'butir' },
    el('p', { class: 'butir-tanya' }, 'Gambarkan himpunan penyelesaian ', tampilMatematika(item.soal), ' pada garis bilangan.'),
    garis.el, tombol, kotak);
}

const NAMA_OPERASI = {
  tambah: (n) => `ditambah ${n}`,
  kurang: (n) => `dikurangi ${n}`,
  kali: (n) => `dikali ${n}`,
  bagi: (n) => `dibagi ${n}`,
};
const LAMBANG = { tambah: '+', kurang: '−', kali: '·', bagi: ':' };

function butirBandingkan(item, onSelesai) {
  const kotak = kotakUmpan();
  const p = pengelola(item, onSelesai, kotak);
  const a = Pecahan.dari(item.kiri);
  const b = Pecahan.dari(item.kanan);
  const { jenis, nilai } = item.operasi;
  const n = Pecahan.dari(nilai);
  const op = { tambah: 'tambah', kurang: 'kurang', kali: 'kali', bagi: 'bagi' }[jenis];
  const a2 = a[op](n);
  const b2 = b[op](n);
  const tandaAwal = a.banding(b) < 0 ? '<' : '>';
  const tandaAkhir = a2.banding(b2) < 0 ? '<' : '>';
  const tetap = tandaAwal === tandaAkhir;
  const nTeks = n.tanda() < 0 ? `(${n})` : `${n}`;
  const bentuk = (x) => `${x} ${LAMBANG[jenis]} ${nTeks}`;

  const garisHasil = () =>
    el('p', { class: 'pembahasan' },
      `${teksRapi(String(a2))} berada di sebelah ${tandaAkhir === '<' ? 'kiri' : 'kanan'} ${teksRapi(String(b2))} pada garis bilangan, `,
      tetap ? 'jadi tandanya tetap.' : el('strong', { class: 'teks-balik' }, 'jadi tandanya berubah (dibalik)!'));

  const { el: daftar, tombol } = pilihanTombol(['<', '>'], {
    konten: (o) => el('span', { class: 'mat mat-besar' }, o),
    onPilih(i, t) {
      if (p.selesai) return;
      const pilihan = i === 0 ? '<' : '>';
      const benar = pilihan === tandaAkhir;
      t.classList.add(benar ? 'opsi-benar' : 'opsi-salah');
      t.disabled = true;
      const pesan = benar ? null : `Hitung dulu: ${teksRapi(bentuk(a))} = ${teksRapi(String(a2))} dan ${teksRapi(bentuk(b))} = ${teksRapi(String(b2))}.`;
      if (p.nilai({ benar, pesan, pembahasan: [garisHasil()] })) tombol.forEach((x) => (x.disabled = true));
    },
  });

  return el('div', { class: 'butir' },
    el('p', { class: 'butir-tanya' }, 'Diketahui ', tampilMatematika(`${a} ${tandaAwal} ${b}`), '. ',
      `Jika kedua ruas ${teksRapi(NAMA_OPERASI[jenis](String(n)))}, tanda apa yang tepat?`),
    el('div', { class: 'soal-besar' }, tampilMatematika(`${bentuk(a)}`), el('span', { class: 'mat mat-besar kotak-tanya' }, ' ? '), tampilMatematika(`${bentuk(b)}`)),
    daftar, kotak);
}

const PEMBUAT = {
  pilihan: butirPilihan,
  isian: butirIsian,
  memenuhi: butirMemenuhi,
  jawab: butirJawab,
  garis: butirGaris,
  bandingkan: butirBandingkan,
};

export function renderButir(item, onSelesai = () => {}) {
  const buat = PEMBUAT[item.tipe];
  if (!buat) throw new Error(`Jenis butir tidak dikenal: ${item.tipe}`);
  return buat(item, onSelesai);
}

// ---------------------------------------------------------------- visual materi

/**
 * Visual pada segmen materi:
 *   { jenis: 'garis', hasil: 'x > 2' }
 *   { jenis: 'rumus', teks: '2x + 3 > 9' }  atau  { jenis: 'rumus', baris: ['…', '…'] }
 *   { jenis: 'tabel', kepala: ['…'], baris: [['…']] }
 */
export function visual(v) {
  if (v.jenis === 'garis') return garisUntuk(v.hasil);
  if (v.jenis === 'rumus') {
    const baris = v.baris ?? [v.teks];
    return el('div', { class: 'rumus' }, ...baris.map((b) => el('div', {}, ...teksCampur(b.includes('$') ? b : `$${b}$`))));
  }
  if (v.jenis === 'tabel') {
    return el('div', { class: 'tabel-wadah' }, el('table', { class: 'tabel' },
      el('thead', {}, el('tr', {}, ...v.kepala.map((k) => el('th', {}, k)))),
      el('tbody', {}, ...v.baris.map((r) => el('tr', {}, ...r.map((c) => el('td', {}, ...teksCampur(c))))))));
  }
  throw new Error(`Jenis visual tidak dikenal: ${v.jenis}`);
}
