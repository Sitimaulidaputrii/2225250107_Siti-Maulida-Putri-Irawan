/**
 * Mengekspor soal dari generator JavaScript ke format bank soal (JSON), agar dapat
 * diperiksa silang oleh validator Python/SymPy:
 *
 *   node tools/ekspor_soal_acak.mjs <folder-keluaran> [jumlah-per-level<=100]
 *   python tools/validasi_soal.py "<folder-keluaran>/soal-acak-*.json"
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { acakBerbenih, buatSoal } from '../frontend/src/engine/index.js';

const [, , keluar, jumlahArg = '100'] = process.argv;
if (!keluar) {
  console.error('Pemakaian: node tools/ekspor_soal_acak.mjs <folder-keluaran> [jumlah]');
  process.exit(1);
}
const jumlah = Math.min(100, Number(jumlahArg)); // id skema: L<level>-<2 digit>
const MODUL = { 1: 'M3', 2: 'M3', 3: 'M4', 4: 'M5' };

mkdirSync(keluar, { recursive: true });
for (const level of [1, 2, 3, 4]) {
  const rng = acakBerbenih(Date.now() + level); // benih berbeda setiap kali → cakupan makin luas
  const data = Array.from({ length: jumlah }, (_, i) => {
    const s = buatSoal(level, rng);
    return {
      id: `L${level}-${String(i).padStart(2, '0')}`,
      level,
      modul: MODUL[level],
      jenis: 'aljabar',
      soal: s.soal,
      semesta: 'real',
      jawaban: s.jawaban,
      langkah: s.langkah.map(({ ekspresi, penjelasan }) => ({ ekspresi, penjelasan })),
    };
  });
  writeFileSync(join(keluar, `soal-acak-L${level}.json`), JSON.stringify(data, null, 1));
}
console.log(`${jumlah * 4} soal acak diekspor ke ${keluar}`);
