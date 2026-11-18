/**
 * Sinkronisasi offline-first: data dicatat lokal dulu, lalu dikirim ke server saat daring
 * dan siswa tergabung ke kelas. Pengiriman idempoten (id dibuat di perangkat).
 */
import { GalatApi, ambilSesi, panggil, simpanSesi } from './api.js';
import { simpanPengaturanKelas } from './pengaturan.js';
import {
  ambilSemuaPercobaan,
  ambilSkalaBelumTerkirim,
  tandaiSkalaTersinkron,
  tandaiTersinkron,
} from './penyimpanan.js';

const UKURAN_KIRIMAN = 200;
let berjalan = null;
let jeda = null;

/** Mengubah catatan lokal ke format API (snake_case). */
export function keFormatApi(p) {
  return {
    id: p.id,
    waktu_klien: p.waktu,
    modul: p.modul ?? null,
    soal: p.soal ?? null,
    level: p.level ?? null,
    fase: p.fase ?? null,
    benar: !!p.benar,
    kode_kesalahan: p.kode ?? null,
    pakai_petunjuk: !!p.pakaiPetunjuk,
  };
}

async function jalankan() {
  const sesi = await ambilSesi();
  if (!sesi?.token || !navigator.onLine) return { terkirim: 0, dilewati: true };
  let terkirim = 0;
  try {
    const kelas = await panggil('/kelas/saya', { token: sesi.token });
    await simpanPengaturanKelas(kelas.pengaturan);
    await simpanSesi({ ...sesi, kelas });

    const belum = (await ambilSemuaPercobaan()).filter((p) => !p.tersinkron);
    for (let i = 0; i < belum.length; i += UKURAN_KIRIMAN) {
      const potongan = belum.slice(i, i + UKURAN_KIRIMAN);
      await panggil('/progres/percobaan', { metode: 'POST', isi: potongan.map(keFormatApi), token: sesi.token });
      await tandaiTersinkron(potongan.map((p) => p.id));
      terkirim += potongan.length;
    }

    const skala = await ambilSkalaBelumTerkirim();
    if (skala.length) {
      await panggil('/progres/skala-beban', {
        metode: 'POST',
        token: sesi.token,
        isi: skala.map((s) => ({ id: s.id, waktu_klien: s.waktu, aktivitas: s.aktivitas, jenis: s.jenis, item: s.item, skor: s.skor })),
      });
      await tandaiSkalaTersinkron(skala.map((s) => s.id));
    }
    return { terkirim };
  } catch (e) {
    if (e instanceof GalatApi && e.status === 401) {
      // Token kedaluwarsa: minta siswa masuk lagi lewat Pengaturan
      await simpanSesi({ ...sesi, token: null, perluMasuk: true });
    }
    return { terkirim, galat: e.message };
  }
}

/** Menjalankan sinkronisasi (tidak pernah berjalan ganda). */
export function sinkronkan() {
  berjalan ??= jalankan().finally(() => (berjalan = null));
  return berjalan;
}

/** Sinkron beberapa detik setelah aktivitas terakhir (hemat baterai & kuota). */
export function sinkronNanti(ms = 5000) {
  clearTimeout(jeda);
  jeda = setTimeout(sinkronkan, ms);
}

export function mulaiSinkronOtomatis() {
  window.addEventListener('online', () => sinkronkan());
  sinkronkan();
}
