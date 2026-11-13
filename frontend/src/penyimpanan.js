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
  if (!db) {
    cadangan.percobaan.push(catatan);
    return catatan;
  }
  try {
    await permintaan(db, 'percobaan', 'readwrite', (s) => s.put(catatan));
  } catch {
    cadangan.percobaan.push(catatan);
  }
  return catatan;
}

// ------------------------------------------------------------- progres modul

export const progresKosong = () => ({ selesai: [], total: 0, latihan: {}, kuis: {} });

export async function ambilProgres(idModul) {
  return { ...progresKosong(), ...(await ambil(`progres:${idModul}`, {})) };
}

export async function simpanProgres(idModul, progres) {
  await simpan(`progres:${idModul}`, progres);
}
