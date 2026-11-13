/**
 * Validasi otomatis konten modul (public/konten/modul-*.json):
 * struktur benar, setiap pertidaksamaan terbaca mesin, kunci pilihan/isian valid.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { Pecahan } from '../src/engine/pecahan.js';
import { parsePertidaksamaan } from '../src/engine/parser.js';
import { langkahPenyelesaian, selesaikan } from '../src/engine/penyelesai.js';
import { buatSoal } from '../src/engine/generator.js';
import { DAFTAR_MODUL } from '../src/modul.js';

const folder = new URL('../public/konten/', import.meta.url);
const berkas = readdirSync(folder).filter((f) => /^modul-M\d\.json$/.test(f));
const muat = (f) => JSON.parse(readFileSync(new URL(f, folder), 'utf-8'));

/** Mengambil semua $…$ dari teks dan memastikan bagian yang berupa pertidaksamaan x terbaca. */
function cekTeksMatematika(teks, lokasi) {
  for (const [, isi] of String(teks).matchAll(/\$([^$]+)\$/g)) {
    // Hanya ekspresi yang variabelnya x saja (notasi umum seperti "x > a" dilewati)
    if (/x/.test(isi) && /[<>=≤≥]/.test(isi) && !/[a-wyzA-WYZ]/.test(isi)) {
      expect(() => parsePertidaksamaan(isi), `${lokasi}: "${isi}"`).not.toThrow();
    }
  }
}

function cekButir(b, lokasi) {
  const di = `${lokasi} (${b.tipe})`;
  switch (b.tipe) {
    case 'pilihan':
      expect(Array.isArray(b.opsi) && b.opsi.length >= 2, di).toBe(true);
      expect(Number.isInteger(b.benar) && b.benar >= 0 && b.benar < b.opsi.length, `${di}: indeks benar`).toBe(true);
      if (b.umpan) expect(b.umpan.length, `${di}: panjang umpan`).toBeLessThanOrEqual(b.opsi.length);
      [b.pertanyaan, ...b.opsi].forEach((t) => cekTeksMatematika(t, di));
      break;
    case 'isian':
      expect(() => Pecahan.dari(b.jawaban), di).not.toThrow();
      cekTeksMatematika(b.pertanyaan, di);
      break;
    case 'memenuhi':
      expect(() => parsePertidaksamaan(b.soal), di).not.toThrow();
      expect(() => Pecahan.dari(b.nilai), di).not.toThrow();
      break;
    case 'jawab':
    case 'garis':
      expect(selesaikan(b.soal).jenis, `${di}: harus punya titik batas`).toBe('batas');
      break;
    case 'bandingkan': {
      const a = Pecahan.dari(b.kiri);
      expect(a.banding(b.kanan), `${di}: kedua ruas harus berbeda`).not.toBe(0);
      expect(['tambah', 'kurang', 'kali', 'bagi'], di).toContain(b.operasi.jenis);
      expect(Pecahan.dari(b.operasi.nilai).nol(), `${di}: operasi dengan nol`).toBe(false);
      break;
    }
    default:
      throw new Error(`${di}: tipe butir tidak dikenal`);
  }
}

describe('konten modul', () => {
  it('setiap modul bertanda "tersedia" punya file konten', () => {
    for (const m of DAFTAR_MODUL.filter((x) => x.tersedia)) {
      expect(berkas, m.id).toContain(`modul-${m.id}.json`);
    }
  });

  for (const nama of berkas) {
    it(nama, () => {
      const k = muat(nama);
      expect(nama).toBe(`modul-${k.id}.json`);
      expect(k.judul && k.tujuan, 'judul & tujuan').toBeTruthy();
      expect(k.bagian.length).toBeGreaterThan(0);
      k.bagian.forEach((bag, i) => {
        const lokasi = `${k.id}/bagian ${i}`;
        expect(bag.judul, lokasi).toBeTruthy();
        if (bag.jenis === 'materi') {
          expect(bag.segmen.length, lokasi).toBeGreaterThan(0);
          bag.segmen.forEach((s, j) => {
            const teks = [].concat(s.teks ?? []);
            // Prinsip beban kognitif: segmen singkat (≤ 4 kalimat)
            const kalimat = teks.join(' ').split(/[.!?](\s|$)/).filter((x) => x && x.trim().length > 2).length;
            expect(kalimat, `${lokasi}/segmen ${j}: terlalu panjang`).toBeLessThanOrEqual(4);
            teks.forEach((t) => cekTeksMatematika(t, `${lokasi}/segmen ${j}`));
            if (s.visual?.jenis === 'garis') expect(selesaikan(s.visual.hasil).jenis).toBe('batas');
            if (s.visual?.jenis === 'rumus') [].concat(s.visual.baris ?? s.visual.teks).forEach((t) => cekTeksMatematika(t.includes('$') ? t : `$${t}$`, lokasi));
            if (s.aktivitas) cekButir(s.aktivitas, `${lokasi}/segmen ${j}`);
          });
        } else if (bag.jenis === 'contoh') {
          const langkah = langkahPenyelesaian(bag.soal);
          expect(langkah.length, lokasi).toBeGreaterThan(1);
          if (bag.prompt) cekButir({ tipe: 'pilihan', ...bag.prompt }, `${lokasi}/prompt`);
        } else if (bag.jenis === 'latihan') {
          expect(() => buatSoal(bag.level, undefined, { hanya: bag.hanya }), lokasi).not.toThrow();
        } else if (bag.jenis === 'kuis') {
          expect(bag.soal.length, lokasi).toBeGreaterThan(0);
          bag.soal.forEach((b, j) => cekButir(b, `${lokasi}/soal ${j}`));
          if (bag.lulus !== undefined) expect(bag.lulus > 0 && bag.lulus <= 1, lokasi).toBe(true);
        } else {
          throw new Error(`${lokasi}: jenis bagian tidak dikenal "${bag.jenis}"`);
        }
      });
    });
  }
});

describe('generator: opsi tambahKurang (latihan M3)', () => {
  it('hanya menghasilkan bentuk x ± b tanpa pembagian', () => {
    for (let i = 0; i < 200; i++) {
      const s = buatSoal(1, undefined, { hanya: 'tambahKurang' });
      expect(s.soal, s.soal).toMatch(/^x [+-] \d+ /);
      expect(s.langkah).toHaveLength(2);
    }
  });
});
