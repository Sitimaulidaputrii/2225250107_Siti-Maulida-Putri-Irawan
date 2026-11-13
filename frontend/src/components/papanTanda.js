/**
 * Papan masukan jawaban: tombol tanda (<, >, ≤, ≥) + papan angka.
 * Siswa tidak perlu mengetik bebas (mengurangi beban ekstrinsik antarmuka — D20).
 * Logika masukan dipisah sebagai fungsi murni `ketik` agar mudah diuji.
 */
import { el } from '../dom.js';
import { Pecahan } from '../engine/pecahan.js';

export const keadaanAwal = () => ({ tanda: null, nilai: '' });

const TANDA = ['<', '>', '<=', '>='];
const TAMPIL_TANDA = { '<': '<', '>': '>', '<=': '≤', '>=': '≥' };
const BATAS_PANJANG = 9;

/** Memproses satu tombol; mengembalikan keadaan baru. */
export function ketik(k, tombol) {
  const { tanda, nilai } = k;
  if (TANDA.includes(tombol)) return { tanda: tombol, nilai };
  if (tombol === 'hapus') {
    if (nilai) return { tanda, nilai: nilai.slice(0, -1) };
    return { tanda: null, nilai };
  }
  if (tombol === 'negatif') {
    return { tanda, nilai: nilai.startsWith('-') ? nilai.slice(1) : `-${nilai}` };
  }
  if (nilai.replace('-', '').length >= BATAS_PANJANG) return k;
  if (/^\d$/.test(tombol)) {
    if (nilai === '0') return { tanda, nilai: tombol };
    if (nilai === '-0') return { tanda, nilai: `-${tombol}` };
    return { tanda, nilai: nilai + tombol };
  }
  const berakhirAngka = /\d$/.test(nilai);
  if (tombol === ',' && berakhirAngka && !/[,/]/.test(nilai)) return { tanda, nilai: `${nilai},` };
  if (tombol === '/' && berakhirAngka && !/[,/]/.test(nilai)) return { tanda, nilai: `${nilai}/` };
  return k;
}

/** Memeriksa kelengkapan masukan. */
export function validasi(k, { perluTanda = true } = {}) {
  if (perluTanda && !k.tanda) return { ok: false, pesan: 'Pilih tandanya dulu.' };
  if (!/\d$/.test(k.nilai)) return { ok: false, pesan: 'Lengkapi bilangannya dulu.' };
  try {
    const nilai = Pecahan.dari(k.nilai);
    return { ok: true, jawaban: { tanda: k.tanda, nilai } };
  } catch {
    return { ok: false, pesan: 'Bilangannya belum benar (penyebut tidak boleh 0).' };
  }
}

const tampilNilai = (nilai) => (nilai ? nilai.replace('-', '−') : ' ');

/**
 * @param {object} p
 * @param {boolean} [p.perluTanda=true]  false → hanya angka (mis. "−3 + 7 = ?")
 * @param {string}  [p.awalan='x']       teks di depan jawaban, mis. "x" atau "x ="
 * @param {(jawaban) => void} p.onKirim
 */
export function papanTanda({ perluTanda = true, awalan = 'x', labelKirim = 'Periksa', onKirim }) {
  let k = keadaanAwal();
  let aktif = true;

  const kotakTanda = el('span', { class: 'papan-kotak papan-tanda' });
  const kotakNilai = el('span', { class: 'papan-kotak papan-nilai' });
  const pesan = el('p', { class: 'papan-pesan', role: 'status' });
  const layar = el('div', { class: 'papan-layar', 'aria-live': 'polite' },
    awalan ? el('span', { class: 'papan-awalan mat-x' }, awalan) : null,
    perluTanda ? kotakTanda : null,
    kotakNilai);

  function render() {
    kotakTanda.textContent = k.tanda ? TAMPIL_TANDA[k.tanda] : '?';
    kotakTanda.classList.toggle('kosong', !k.tanda);
    kotakNilai.textContent = tampilNilai(k.nilai);
    kotakNilai.classList.toggle('kosong', !k.nilai);
    for (const t of tombolTanda) t.setAttribute('aria-pressed', String(t.dataset.tanda === k.tanda));
  }

  function tekan(tombol) {
    if (!aktif) return;
    if (tombol === 'kirim') {
      const v = validasi(k, { perluTanda });
      pesan.textContent = v.ok ? '' : v.pesan;
      if (v.ok) onKirim(v.jawaban);
      return;
    }
    k = ketik(k, tombol);
    pesan.textContent = '';
    render();
  }

  const tombol = (label, nilai, kelas = 'kunci', aria) =>
    el('button', { type: 'button', class: kelas, 'aria-label': aria, onclick: () => tekan(nilai) }, label);

  const tombolTanda = TANDA.map((t) => {
    const b = tombol(TAMPIL_TANDA[t], t, 'kunci kunci-tanda', `tanda ${TAMPIL_TANDA[t]}`);
    b.dataset.tanda = t;
    return b;
  });

  const papan = el('div', { class: 'papan-kunci' },
    ...(perluTanda ? tombolTanda : []),
    tombol('7', '7'), tombol('8', '8'), tombol('9', '9'), tombol('⌫', 'hapus', 'kunci kunci-fungsi', 'hapus'),
    tombol('4', '4'), tombol('5', '5'), tombol('6', '6'), tombol('−', 'negatif', 'kunci kunci-fungsi', 'tanda negatif'),
    tombol('1', '1'), tombol('2', '2'), tombol('3', '3'), tombol('/', '/', 'kunci kunci-fungsi', 'garis pecahan'),
    tombol(',', ',', 'kunci kunci-fungsi', 'koma desimal'), tombol('0', '0'),
    tombol(labelKirim, 'kirim', 'kunci kunci-kirim'),
  );

  const wadah = el('div', { class: 'papan', tabindex: '0' }, layar, pesan, papan);

  // Papan ketik fisik (laptop/PC)
  wadah.addEventListener('keydown', (e) => {
    const peta = { Backspace: 'hapus', Enter: 'kirim', '-': 'negatif', ',': ',', '.': ',', '/': '/', '<': '<', '>': '>' };
    const t = /^\d$/.test(e.key) ? e.key : peta[e.key];
    if (!t) return;
    e.preventDefault();
    if (t === '<' || t === '>') {
      // Menekan < dua kali → ≤
      tekan(k.tanda === t ? `${t}=` : t);
    } else tekan(t);
  });

  render();
  return {
    el: wadah,
    reset() {
      k = keadaanAwal();
      pesan.textContent = '';
      render();
    },
    nonaktifkan(n = true) {
      aktif = !n;
      wadah.classList.toggle('nonaktif', n);
      for (const b of wadah.querySelectorAll('button')) b.disabled = n;
    },
  };
}
