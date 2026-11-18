/**
 * Soal cerita PtLSV dalam 5 tahap tetap (desain D13–D14, dokumen 04 §M6):
 *   ① Tandai      — stabilo angka & kata kunci (mengurangi pencarian informasi, EL05)
 *   ② Misalkan    — apa yang dimisalkan x?
 *   ③ Model       — pilih model pertidaksamaan (diagnosis E7)
 *   ④ Selesaikan  — papan tanda (diagnosis E1–E5)
 *   ⑤ Tafsirkan   — jawaban dalam konteks & semesta (diagnosis E8)
 * Hasil setiap tahap tetap terlihat di ringkasan (mengurangi beban memori kerja).
 *
 * Mode `contoh: true` menampilkan kelima tahap terisi, dibuka satu per ketukan.
 */
import { el } from '../dom.js';
import { diagnosisJawaban, diagnosisModel, diagnosisTafsiran } from '../engine/diagnosis.js';
import { formatHasil, langkahPenyelesaian, selesaikan } from '../engine/penyelesai.js';
import { tampilMatematika } from '../ui/matematika.js';
import { barisLangkah } from './langkahDemiLangkah.js';
import { papanTanda } from './papanTanda.js';
import { daftarkanButir, teksCampur } from './soal.js';

const TAHAP = ['Tandai', 'Misalkan', 'Model', 'Selesaikan', 'Tafsirkan'];
const MAKS = 2;

const bersih = (k) => k.toLowerCase().replace(/[.,?!:;]+$/g, '');

/** Kata-kata pada teks yang termasuk informasi penting (untuk menandai & memeriksa). */
export function indeksPenting(kata, tokenPenting) {
  const hasil = new Map(); // indeks token penting → daftar indeks kata
  tokenPenting.forEach((tok, ti) => {
    const bagian = tok.toLowerCase().split(/\s+/).map(bersih);
    for (let i = 0; i + bagian.length <= kata.length; i++) {
      if (bagian.every((b, j) => bersih(kata[i + j]) === b)) {
        hasil.set(ti, Array.from({ length: bagian.length }, (_, j) => i + j));
        break;
      }
    }
  });
  return hasil;
}

function tahapan(aktif) {
  return el('ol', { class: 'tahap-cerita', 'aria-label': `Tahap ${aktif + 1} dari 5` },
    ...TAHAP.map((t, i) => el('li', { class: i < aktif ? 'selesai' : i === aktif ? 'aktif' : '' }, `${i + 1} ${t}`)));
}

export function soalCerita(item, onSelesai = () => {}, { contoh = false } = {}) {
  const kata = item.teks.split(/\s+/);
  const penting = indeksPenting(kata, item.token_penting ?? []);
  const semuaPenting = new Set([...penting.values()].flat());
  const ditandai = new Set();
  const hasil = selesaikan(item.model);
  let tahap = 0;
  let benarSemua = true;
  let kodePertama = null;

  const kepala = el('div', {});
  const teks = el('p', { class: 'teks-cerita' });
  const ringkasan = el('ul', { class: 'ringkasan-cerita' });
  const area = el('div', {});

  const tombolKata = kata.map((k, i) => el('button', {
    type: 'button',
    class: 'kata',
    'aria-pressed': 'false',
    onclick: (e) => {
      if (contoh || tahap > 0) return;
      ditandai.has(i) ? ditandai.delete(i) : ditandai.add(i);
      e.currentTarget.classList.toggle('stabilo', ditandai.has(i));
      e.currentTarget.setAttribute('aria-pressed', String(ditandai.has(i)));
    },
  }, k));
  tombolKata.forEach((b, i) => teks.append(b, i < kata.length - 1 ? ' ' : ''));

  function catatGalat(kode) {
    benarSemua = false;
    kodePertama ??= kode;
  }

  function umpan(benar, pesan) {
    return el('div', { class: benar ? 'umpan umpan-benar' : 'umpan umpan-cek', role: 'status' },
      el('p', { class: 'umpan-judul' }, benar ? 'Tepat! 🙂' : 'Belum tepat'),
      pesan ? el('p', {}, ...teksCampur(pesan)) : null);
  }

  function tambahRingkasan(label, ...isi) {
    ringkasan.append(el('li', {}, el('span', { class: 'ringkasan-label' }, `${label}: `), ...isi));
  }

  function lanjutKe(n) {
    tahap = n;
    kepala.replaceChildren(tahapan(Math.min(n, 4)));
    if (n >= TAHAP.length) {
      area.replaceChildren(el('div', { class: 'kartu' }, el('p', { class: 'langkah-hasil' }, '✔ ', item.tafsiran)));
      onSelesai({ benarPertama: benarSemua, kode: kodePertama });
      return;
    }
    [tahapTandai, tahapMisalkan, tahapModel, tahapSelesaikan, tahapTafsir][n]();
  }

  const tombolLanjut = (teksTombol = 'Lanjut →') =>
    el('button', { type: 'button', class: 'tombol', onclick: () => lanjutKe(tahap + 1) }, teksTombol);

  // ① Tandai -----------------------------------------------------------------
  function tahapTandai() {
    if (contoh) {
      semuaPenting.forEach((i) => tombolKata[i].classList.add('stabilo'));
      area.replaceChildren(el('p', { class: 'redup' }, 'Angka dan kata kunci yang penting sudah ditandai kuning.'), tombolLanjut('Langkah berikutnya →'));
      return;
    }
    const info = el('div', {});
    area.replaceChildren(
      el('p', { class: 'latihan-tanya' }, '🖍 Ketuk angka dan kata kunci yang penting untuk menandainya.'),
      info,
      el('div', { class: 'baris-tombol' },
        el('button', {
          type: 'button',
          class: 'tombol tombol-kedua',
          onclick: () => {
            const kena = [...penting.values()].filter((idx) => idx.some((i) => ditandai.has(i))).length;
            info.replaceChildren(el('p', { class: 'umpan umpan-benar' },
              `Kamu menandai ${kena} dari ${penting.size} informasi penting.`,
              kena < penting.size ? ' Yang belum ditandai diberi garis putus-putus.' : ' Lengkap! 👍'));
            semuaPenting.forEach((i) => !ditandai.has(i) && tombolKata[i].classList.add('stabilo-saran'));
          },
        }, 'Periksa tandaku'),
        tombolLanjut()));
  }

  // ② Misalkan ---------------------------------------------------------------
  function tahapMisalkan() {
    const m = item.misalkan;
    const selesai = () => tambahRingkasan('Misalkan', item.variabel);
    if (contoh) {
      selesai();
      area.replaceChildren(tombolLanjut('Langkah berikutnya →'));
      return;
    }
    pilihanTahap('Apa yang dimisalkan dengan x?', m.opsi.map((o) => [o]), m.benar,
      () => 'Perhatikan apa yang ditanyakan pada kalimat terakhir soal.', null, selesai);
  }

  // ③ Model ------------------------------------------------------------------
  function tahapModel() {
    const opsi = item.opsi_model;
    const benar = opsi.findIndex((o) => diagnosisModel(item.model, o).benar);
    const selesai = () => tambahRingkasan('Model', tampilMatematika(item.model));
    if (contoh) {
      selesai();
      area.replaceChildren(el('p', {}, ...teksCampur(item.alasan_model ?? '')), tombolLanjut('Langkah berikutnya →'));
      return;
    }
    pilihanTahap('Model pertidaksamaan yang tepat adalah …', opsi.map((o) => [tampilMatematika(o)]), benar,
      (i) => diagnosisModel(item.model, opsi[i]).pesan, 'E7', selesai);
  }

  /** Pilihan ganda untuk tahap ② dan ③ (maks. 2 percobaan, lalu jawaban ditunjukkan). */
  function pilihanTahap(tanya, opsi, benar, pesanSalah, kode, selesai) {
    let coba = 0;
    const kotak = el('div', {});
    const tombol = opsi.map((isi, i) => el('button', {
      type: 'button',
      class: 'opsi',
      onclick: (e) => {
        coba++;
        const ok = i === benar;
        e.currentTarget.classList.add(ok ? 'opsi-benar' : 'opsi-salah');
        e.currentTarget.disabled = true;
        if (!ok && coba === 1 && kode) catatGalat(kode);
        if (!ok && coba === 1 && !kode) benarSemua = false;
        if (ok || coba >= MAKS) {
          tombol.forEach((t) => (t.disabled = true));
          tombol[benar].classList.add('opsi-benar');
          kotak.replaceChildren(umpan(ok, ok ? null : 'Jawaban yang tepat sudah ditandai ✔.'), tombolLanjut());
          selesai();
        } else {
          kotak.replaceChildren(umpan(false, pesanSalah(i)));
        }
      },
    }, ...isi));
    area.replaceChildren(el('p', { class: 'latihan-tanya' }, tanya), el('div', { class: 'daftar-opsi' }, ...tombol), kotak);
  }

  // ④ Selesaikan -------------------------------------------------------------
  function tahapSelesaikan() {
    const langkah = langkahPenyelesaian(item.model);
    const daftarLangkah = el('ol', { class: 'daftar-langkah' }, ...langkah.map(barisLangkah));
    const selesai = () => tambahRingkasan('Hasil', tampilMatematika(formatHasil(hasil)));
    if (contoh) {
      selesai();
      area.replaceChildren(daftarLangkah, tombolLanjut('Langkah berikutnya →'));
      return;
    }
    let coba = 0;
    const kotak = el('div', {});
    const papan = papanTanda({
      onKirim(jawaban) {
        coba++;
        const d = diagnosisJawaban(item.model, jawaban);
        if (!d.benar && coba === 1) catatGalat(d.kode);
        if (d.benar || coba >= MAKS) {
          papan.nonaktifkan();
          selesai();
          kotak.replaceChildren(umpan(d.benar, d.benar ? null : d.pesan),
            el('details', { open: !d.benar }, el('summary', {}, 'Langkah penyelesaian'), daftarLangkah), tombolLanjut());
        } else {
          kotak.replaceChildren(umpan(false, d.pesan));
          papan.reset();
        }
      },
    });
    area.replaceChildren(el('p', { class: 'latihan-tanya' }, 'Selesaikan ', tampilMatematika(item.model), ':'), papan.el, kotak);
  }

  // ⑤ Tafsirkan --------------------------------------------------------------
  function tahapTafsir() {
    if (contoh) {
      area.replaceChildren(el('p', {}, ...teksCampur(item.alasan_tafsir ?? '')), tombolLanjut('Selesai'));
      return;
    }
    let coba = 0;
    const kotak = el('div', {});
    const papan = papanTanda({
      perluTanda: false,
      awalan: '',
      onKirim({ nilai }) {
        coba++;
        const d = diagnosisTafsiran(hasil, item.semesta, nilai);
        if (!d.benar && coba === 1) catatGalat(d.kode);
        if (d.benar || coba >= MAKS) {
          papan.nonaktifkan();
          kotak.replaceChildren(umpan(d.benar, d.benar ? null : d.pesan), tombolLanjut('Selesai'));
        } else {
          kotak.replaceChildren(umpan(false, d.pesan));
          papan.reset();
        }
      },
    });
    area.replaceChildren(el('p', { class: 'latihan-tanya' }, ...teksCampur(item.tanya_tafsir)),
      item.satuan ? el('p', { class: 'redup' }, `Jawab dengan angka saja (dalam ${item.satuan}).`) : null,
      papan.el, kotak);
  }

  lanjutKe(0);
  return el('div', { class: 'butir soal-cerita' }, kepala, teks, ringkasan, area);
}

daftarkanButir('cerita', (item, onSelesai) => soalCerita(item, onSelesai));
