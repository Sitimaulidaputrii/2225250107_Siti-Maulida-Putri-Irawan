/**
 * Pengaturan tampilan (per perangkat) dan pengaturan kelas (dari guru, untuk penelitian).
 */
import { ambil, simpan } from './penyimpanan.js';

export const PENGATURAN_BAWAAN = {
  ukuranHuruf: 'normal', // normal | besar | sangat-besar
  tema: 'sistem', // sistem | terang | gelap
  kurangiAnimasi: false,
};

/** Fitur yang dapat diatur guru per kelas (F9.2, F12). */
export const KELAS_BAWAAN = {
  promptPenjelasan: true, // prompt penjelasan diri (GL04)
  skalaBeban: false, // skala usaha mental Paas & kuesioner beban kognitif
};

let cacheTampilan = null;
let cacheKelas = null;

export async function ambilPengaturan() {
  cacheTampilan ??= { ...PENGATURAN_BAWAAN, ...(await ambil('pengaturan', {})) };
  return cacheTampilan;
}

export async function simpanPengaturan(perubahan) {
  cacheTampilan = { ...(await ambilPengaturan()), ...perubahan };
  await simpan('pengaturan', cacheTampilan);
  terapkanTampilan(cacheTampilan);
  return cacheTampilan;
}

export async function ambilPengaturanKelas() {
  cacheKelas ??= { ...KELAS_BAWAAN, ...(await ambil('pengaturanKelas', {})) };
  return cacheKelas;
}

export async function simpanPengaturanKelas(nilai) {
  cacheKelas = { ...KELAS_BAWAAN, ...nilai };
  await simpan('pengaturanKelas', cacheKelas);
  return cacheKelas;
}

/** Menerapkan pengaturan ke elemen <html> (atribut dibaca oleh CSS). */
export function terapkanTampilan(p) {
  const akar = document.documentElement;
  akar.dataset.huruf = p.ukuranHuruf;
  if (p.tema === 'sistem') delete akar.dataset.theme;
  else akar.dataset.theme = p.tema === 'gelap' ? 'dark' : 'light';
  akar.classList.toggle('kurangi-animasi', !!p.kurangiAnimasi);
}
