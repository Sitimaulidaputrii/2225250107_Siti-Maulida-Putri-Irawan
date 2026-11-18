/**
 * Penyimpanan lokal berbasis IndexedDB (berfungsi offline).
 * - store "kv"         : progres per modul, pengaturan
 * - store "percobaan"  : log setiap jawaban (untuk sinkron ke server di Sprint 5)
 * Jika IndexedDB tidak tersedia (mode privat tertentu), memakai memori sementara.
 */
const NAMA_DB = 'tandatepat';
const VERSI_DB = 1;

let janjiDb = null;
const cadangan = { kv: new Map(), percobaan: [] };

function bukaDb() {
  if (janjiDb) return janjiDb;
  janjiDb = new Promise((selesai) => {
    try {
      const req = indexedDB.open(NAMA_DB, VERSI_DB);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv');
        if (!db.objectStoreNames.contains('percobaan')) {
          db.createObjectStore('percobaan', { keyPath: 'id' });
        }
      };
      req.onsuccess = () => selesai(req.result);
      req.onerror = () => selesai(null);
      req.onblocked = () => selesai(null);
    } catch {
      selesai(null);
    }
  });
  return janjiDb;
}

function permintaan(db, store, mode, kerja) {
  return new Promise((selesai, gagal) => {
    const tx = db.transaction(store, mode);
    const req = kerja(tx.objectStore(store));
    tx.oncomplete = () => selesai(req?.result);
    tx.onerror = () => gagal(tx.error);
  });
}

export async function ambil(kunci, bawaan = null) {
  const db = await bukaDb();
  if (!db) return cadangan.kv.has(kunci) ? structuredClone(cadangan.kv.get(kunci)) : bawaan;
  try {
    const nilai = await permintaan(db, 'kv', 'readonly', (s) => s.get(kunci));
    return nilai === undefined ? bawaan : nilai;
  } catch {
    return bawaan;
  }
}

export async function simpan(kunci, nilai) {
  const db = await bukaDb();
  if (!db) {
    cadangan.kv.set(kunci, structuredClone(nilai));
    return;
  }
  try {
    await permintaan(db, 'kv', 'readwrite', (s) => s.put(nilai, kunci));
  } catch {
    cadangan.kv.set(kunci, structuredClone(nilai));
  }
}

const idAcak = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

/** Mencatat satu percobaan menjawab (dipakai dasbor guru & penelitian nanti). */
export async function catatPercobaan(data) {
  const catatan = { id: idAcak(), waktu: new Date().toISOString(), tersinkron: false, ...data };
  const db = await bukaDb();
  try {
    if (!db) throw new Error('tanpa IndexedDB');
    await permintaan(db, 'percobaan', 'readwrite', (s) => s.put(catatan));
  } catch {
    cadangan.percobaan.push(catatan);
  }
  // Memberi tahu modul sinkron (tanpa ketergantungan melingkar)
  globalThis.dispatchEvent?.(new CustomEvent('percobaan-baru'));
  return catatan;
}

/** Semua catatan percobaan (urut waktu). */
export async function ambilSemuaPercobaan() {
  const db = await bukaDb();
  if (!db) return [...cadangan.percobaan];
  try {
    const semua = await permintaan(db, 'percobaan', 'readonly', (s) => s.getAll());
    return [...(semua ?? []), ...cadangan.percobaan].sort((a, b) => a.waktu.localeCompare(b.waktu));
  } catch {
    return [...cadangan.percobaan];
  }
}

/** Menandai catatan yang sudah terkirim ke server. */
export async function tandaiTersinkron(ids) {
  const db = await bukaDb();
  const set = new Set(ids);
  for (const c of cadangan.percobaan) if (set.has(c.id)) c.tersinkron = true;
  if (!db || !ids.length) return;
  await permintaan(db, 'percobaan', 'readwrite', (s) => {
    for (const id of ids) {
      const r = s.get(id);
      r.onsuccess = () => r.result && s.put({ ...r.result, tersinkron: true });
    }
    return null;
  });
}

// --------------------------------------------------------- skala beban kognitif

/** Menyimpan jawaban skala beban kognitif (Paas / Leppink) untuk dikirim ke server. */
export async function catatSkala(data) {
  const daftar = await ambil('skalaBeban', []);
  daftar.push({ id: idAcak(), waktu: new Date().toISOString(), tersinkron: false, ...data });
  await simpan('skalaBeban', daftar);
}

export async function ambilSkalaBelumTerkirim() {
  return (await ambil('skalaBeban', [])).filter((s) => !s.tersinkron);
}

export async function tandaiSkalaTersinkron(ids) {
  const set = new Set(ids);
  const daftar = (await ambil('skalaBeban', [])).map((s) => (set.has(s.id) ? { ...s, tersinkron: true } : s));
  await simpan('skalaBeban', daftar);
}

// ------------------------------------------------------------- progres modul

export const progresKosong = () => ({ selesai: [], total: 0, latihan: {}, kuis: {} });

export async function ambilProgres(idModul) {
  return { ...progresKosong(), ...(await ambil(`progres:${idModul}`, {})) };
}

export async function simpanProgres(idModul, progres) {
  await simpan(`progres:${idModul}`, progres);
}
