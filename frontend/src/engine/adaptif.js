/**
 * Aturan latihan berjenjang & pemudaran bantuan (fading) — docs/perencanaan/04 §4.6.
 *
 *   contoh     : contoh lengkap; selesai setelah semua langkah dibuka
 *   lengkapi1  : langkah kunci dikosongkan          → 2 benar berturut-turut → lengkapi2
 *   lengkapi2  : langkah kunci + 1 langkah lain kosong → 2 benar berturut-turut → mandiri
 *   mandiri    : hanya soal                          → 3 benar berturut-turut TANPA petunjuk → naik level
 *                salah 2× berturut-turut              → turun ke lengkapi2
 *
 * Semua fungsi murni: menerima status lama, mengembalikan status baru + peristiwa.
 */

export const FASE = ['contoh', 'lengkapi1', 'lengkapi2', 'mandiri'];
export const LEVEL_MAKS = 5;
export const SYARAT_LANJUT = { lengkapi1: 2, lengkapi2: 2, mandiri: 3 };
export const BATAS_SALAH_MANDIRI = 2;

export function statusAwal(level = 1) {
  return { level, fase: 'contoh', benarBeruntun: 0, salahBeruntun: 0, tuntas: false };
}

const keFase = (status, fase) => ({ ...status, fase, benarBeruntun: 0, salahBeruntun: 0 });

/** Dipanggil setelah siswa membuka semua langkah contoh. */
export function selesaiContoh(status) {
  if (status.fase !== 'contoh') return { status, peristiwa: null };
  return { status: keFase(status, 'lengkapi1'), peristiwa: 'naikFase' };
}

/**
 * Mencatat satu jawaban siswa.
 * @param {{benar: boolean, pakaiPetunjuk?: boolean}} jawaban
 * @returns {{status, peristiwa: null|'naikFase'|'turunFase'|'naikLevel'|'tuntas'}}
 */
export function catatJawaban(status, { benar, pakaiPetunjuk = false }) {
  if (status.tuntas || status.fase === 'contoh') return { status, peristiwa: null };

  if (!benar) {
    const baru = { ...status, benarBeruntun: 0, salahBeruntun: status.salahBeruntun + 1 };
    if (status.fase === 'mandiri' && baru.salahBeruntun >= BATAS_SALAH_MANDIRI) {
      return { status: keFase(status, 'lengkapi2'), peristiwa: 'turunFase' };
    }
    return { status: baru, peristiwa: null };
  }

  // Di fase mandiri, jawaban benar dengan petunjuk tidak dihitung dan memutus rangkaian.
  if (status.fase === 'mandiri' && pakaiPetunjuk) {
    return { status: { ...status, benarBeruntun: 0, salahBeruntun: 0 }, peristiwa: null };
  }

  const baru = { ...status, benarBeruntun: status.benarBeruntun + 1, salahBeruntun: 0 };
  if (baru.benarBeruntun < SYARAT_LANJUT[status.fase]) return { status: baru, peristiwa: null };

  if (status.fase === 'mandiri') {
    if (status.level >= LEVEL_MAKS) {
      return { status: { ...keFase(status, 'mandiri'), tuntas: true }, peristiwa: 'tuntas' };
    }
    return { status: statusAwal(status.level + 1), peristiwa: 'naikLevel' };
  }
  const berikut = FASE[FASE.indexOf(status.fase) + 1];
  return { status: keFase(status, berikut), peristiwa: 'naikFase' };
}

/**
 * Indeks langkah yang dikosongkan (harus diisi siswa) untuk fase tertentu.
 * Langkah 0 (soal awal) tidak pernah dikosongkan.
 */
export function langkahDikosongkan(fase, langkah) {
  const n = langkah.length;
  if (fase === 'contoh' || n <= 1) return [];
  if (fase === 'mandiri') return Array.from({ length: n - 1 }, (_, i) => i + 1);
  let kunci = langkah.findIndex((l, i) => i > 0 && l.kunci);
  if (kunci === -1) kunci = n - 1;
  if (fase === 'lengkapi1') return [kunci];
  // lengkapi2: langkah kunci + langkah tepat sebelumnya (bila bukan soal awal)
  const sebelum = kunci - 1 >= 1 ? [kunci - 1] : kunci + 1 < n ? [kunci + 1] : [];
  return [...sebelum, kunci].sort((a, b) => a - b);
}
