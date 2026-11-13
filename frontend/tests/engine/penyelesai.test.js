import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  ekuivalen,
  formatHasil,
  formatLinear,
  langkahPenyelesaian,
  memenuhi,
  perluDisederhanakan,
  selesaikan,
} from '../../src/engine/penyelesai.js';
import { parseLinear } from '../../src/engine/parser.js';

/** Bank soal docs/perencanaan/05 — kuncinya sudah diverifikasi dengan SymPy. */
const BANK = [
  ['x + 5 > 12', 'x > 7'], ['x - 4 <= 3', 'x <= 7'], ['3x <= 15', 'x <= 5'],
  ['x + 9 >= 2', 'x >= -7'], ['4x < -12', 'x < -3'],
  ['2x + 3 > 9', 'x > 3'], ['4x - 7 <= 13', 'x <= 5'], ['5x + 8 >= -2', 'x >= -2'],
  ['3x - 1 < 11', 'x < 4'], ['6 + 2x > 0', 'x > -3'],
  ['-2x > 8', 'x < -4'], ['-3x + 5 <= 11', 'x >= -2'], ['7 - x < 10', 'x > -3'],
  ['-4x - 2 >= 10', 'x <= -3'], ['-5x + 1 < -14', 'x > 3'], ['12 - 3x >= 0', 'x <= 4'],
  ['5x - 2 >= 3x + 6', 'x >= 4'], ['2(x - 3) < 5x + 9', 'x > -5'], ['x/2 + 1 >= 4', 'x >= 6'],
  ['3(2 - x) > x - 10', 'x < 4'], ['(x + 1)/3 <= 2', 'x <= 5'], ['4x + 7 > 6x - 1', 'x < 4'],
  ['14000 + 4000x <= 50000', 'x <= 9'], ['60 + 40x <= 500', 'x <= 11'],
  ['(70 + 72 + x)/3 >= 75', 'x >= 83'], ['2(x + (x + 5)) <= 50', 'x <= 10'], ['6 - 3x < -9', 'x > 5'],
];

describe('selesaikan — 27 soal bank (acuan SymPy)', () => {
  it.each(BANK)('%s  →  %s', (soal, kunci) => {
    expect(formatHasil(selesaikan(soal))).toBe(kunci);
  });
});

describe('selesaikan — kasus khusus', () => {
  it('menandai pembalikan tanda', () => {
    expect(selesaikan('-2x > 8')).toMatchObject({ dibalik: true });
    expect(selesaikan('2x > 8')).toMatchObject({ dibalik: false });
  });

  it('hasil pecahan', () => {
    expect(formatHasil(selesaikan('2x < 3'))).toBe('x < 3/2');
    expect(formatHasil(selesaikan('-4x ≥ 6'), { unicode: true })).toBe('x ≤ −3/2');
  });

  it('suku x habis: semua bilangan atau tidak ada', () => {
    expect(selesaikan('2x + 1 > 2x').jenis).toBe('semua');
    expect(selesaikan('2x + 1 < 2x').jenis).toBe('kosong');
  });

  it('persamaan (untuk modul prasyarat)', () => {
    expect(formatHasil(selesaikan('3x - 2 = 13'))).toBe('x = 5');
  });
});

describe('memenuhi & ekuivalen', () => {
  it('uji substitusi', () => {
    expect(memenuhi('-3x + 5 <= 11', 0)).toBe(true);
    expect(memenuhi('-3x + 5 <= 11', -2)).toBe(true);
    expect(memenuhi('-3x + 5 <= 11', -3)).toBe(false);
  });

  it('bentuk berbeda dengan penyelesaian sama dianggap ekuivalen', () => {
    expect(ekuivalen('x >= -2', '-2 <= x')).toBe(true);
    expect(ekuivalen('-3x <= 6', '-6 <= 3x')).toBe(true);
    expect(ekuivalen('x > -2', 'x >= -2')).toBe(false);
  });
});

describe('formatLinear', () => {
  it.each([
    ['-3x + 5', '-3x + 5'], ['x - 4', 'x - 4'], ['-x', '-x'], ['0', '0'], ['x/2 - 1', '(1/2)x - 1'],
  ])('%s', (masuk, keluar) => expect(formatLinear(parseLinear(masuk))).toBe(keluar));

  it('mode unicode memakai tanda minus asli', () => {
    expect(formatLinear(parseLinear('-3x - 5'), { unicode: true })).toBe('−3x − 5');
  });
});

describe('perluDisederhanakan', () => {
  it.each([
    ['7 - x < 10', false], ['-3x + 5 <= 11', false], ['14000 + 4000x <= 50000', false],
    ['2(x - 3) < 5x + 9', true], ['x/2 + 1 >= 4', true], ['2x + 3x > 5', true], ['x + 2 + 3 > 1', true],
  ])('%s → %s', (soal, harapan) => expect(perluDisederhanakan(soal)).toBe(harapan));
});

describe('langkahPenyelesaian', () => {
  it('contoh dokumen 04: −3x + 5 ≤ 11', () => {
    const l = langkahPenyelesaian('-3x + 5 <= 11');
    expect(l.map((s) => s.ekspresi)).toEqual(['-3x + 5 <= 11', '-3x <= 6', 'x >= -2']);
    expect(l[1].penjelasan).toBe('Kurangi kedua ruas dengan 5. Tanda tetap.');
    expect(l[2]).toMatchObject({ kunci: true, dibalik: true, operasi: { jenis: 'bagi', nilai: '-3' } });
    expect(l[2].penjelasan).toBe('Bagi kedua ruas dengan -3 (negatif). Tanda dibalik.');
  });

  it('7 − x < 10 memakai "kalikan −1"', () => {
    const l = langkahPenyelesaian('7 - x < 10');
    expect(l.map((s) => s.ekspresi)).toEqual(['7 - x < 10', '-x < 3', 'x > -3']);
    expect(l[2].operasi).toEqual({ jenis: 'kali', nilai: '-1' });
  });

  it('variabel di dua ruas', () => {
    const l = langkahPenyelesaian('5x - 2 >= 3x + 6');
    expect(l.map((s) => s.ekspresi)).toEqual(['5x - 2 >= 3x + 6', '2x - 2 >= 6', '2x >= 8', 'x >= 4']);
  });

  it('bentuk berkurung diawali langkah menyederhanakan', () => {
    const l = langkahPenyelesaian('2(x - 3) < 5x + 9');
    expect(l[1].ekspresi).toBe('2x - 6 < 5x + 9');
    expect(l.at(-1).ekspresi).toBe('x > -5');
  });

  it('SETIAP langkah ekuivalen dengan soal (seluruh bank) dan tepat satu langkah kunci', () => {
    for (const [soal] of BANK) {
      const l = langkahPenyelesaian(soal);
      for (const s of l) expect(ekuivalen(s.ekspresi, soal), `${soal} :: ${s.ekspresi}`).toBe(true);
      expect(l.filter((s) => s.kunci).length, soal).toBe(1);
    }
  });
});

describe('konsistensi dengan file konten (sama seperti validator Python)', () => {
  const folder = new URL('../../public/konten/', import.meta.url);
  const berkas = readdirSync(folder).filter((f) => /^soal-.*\.json$/.test(f));

  it('ada file konten', () => expect(berkas.length).toBeGreaterThan(0));

  for (const nama of berkas) {
    const data = JSON.parse(readFileSync(new URL(nama, folder), 'utf-8'));
    for (const soal of data) {
      it(`${nama} · ${soal.id}`, () => {
        const model = soal.model ?? soal.soal;
        const hasil = selesaikan(model);
        expect(hasil.tanda).toBe(soal.jawaban.tanda);
        expect(hasil.nilai.toString()).toBe(soal.jawaban.nilai);
        for (const l of soal.langkah ?? []) expect(ekuivalen(l.ekspresi, model)).toBe(true);
      });
    }
  }
});
