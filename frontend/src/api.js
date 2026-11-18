/**
 * Klien API kecil untuk backend FastAPI. Sesi (token JWT) disimpan di IndexedDB.
 * Peran: 'siswa' (sesi) dan 'guru' (sesiGuru) disimpan terpisah agar guru dapat
 * mencoba aplikasi siswa di perangkat yang sama.
 */
import { ambil, simpan } from './penyimpanan.js';

export class GalatApi extends Error {
  constructor(status, pesan) {
    super(pesan);
    this.status = status;
  }
}

export async function panggil(jalur, { metode = 'GET', isi, token } = {}) {
  let r;
  try {
    r = await fetch(`/api${jalur}`, {
      method: metode,
      headers: {
        ...(isi !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: isi !== undefined ? JSON.stringify(isi) : undefined,
    });
  } catch {
    throw new GalatApi(0, 'Tidak dapat terhubung ke server. Periksa internetmu.');
  }
  if (!r.ok) {
    let pesan = `Terjadi kesalahan (${r.status}).`;
    try {
      const d = await r.json();
      if (typeof d.detail === 'string') pesan = d.detail;
    } catch { /* abaikan */ }
    throw new GalatApi(r.status, pesan);
  }
  const jenis = r.headers.get('content-type') ?? '';
  return jenis.includes('application/json') ? r.json() : r.text();
}

export const ambilSesi = () => ambil('sesi', null);
export const simpanSesi = (s) => simpan('sesi', s);
export const ambilSesiGuru = () => ambil('sesiGuru', null);
export const simpanSesiGuru = (s) => simpan('sesiGuru', s);
