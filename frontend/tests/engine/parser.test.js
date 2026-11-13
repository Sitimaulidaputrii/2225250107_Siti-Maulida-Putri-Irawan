import { describe, expect, it } from 'vitest';
import { GalatParse, parseLinear, parsePertidaksamaan } from '../../src/engine/parser.js';

const lin = (teks) => {
  const l = parseLinear(teks);
  return [l.a.toString(), l.b.toString()];
};

describe('parseLinear', () => {
  it.each([
    ['x', ['1', '0']],
    ['-x', ['-1', '0']],
    ['-3x + 5', ['-3', '5']],
    ['7 − x', ['-1', '7']],
    ['2(x - 3)', ['2', '-6']],
    ['-2(3 - x)', ['2', '-6']],
    ['x/2 + 1', ['1/2', '1']],
    ['(x + 1)/3', ['1/3', '1/3']],
    ['3 · x', ['3', '0']],
    ['12 : 4', ['0', '3']],
    ['2x + 3x - x', ['4', '0']],
    ['2(x + (x + 5))', ['4', '10']],
    ['14.000 + 4.000x', ['4000', '14000']],
    ['2,5x', ['5/2', '0']],
    ['2.5x', ['5/2', '0']],
    ['x(3)', ['3', '0']],
  ])('%s', (teks, harapan) => {
    expect(lin(teks)).toEqual(harapan);
  });

  it.each([
    ['x * x', /bukan linear/],
    ['(x + 1)(x - 1)', /bukan linear/],
    ['6 / x', /memuat x/],
    ['4 / (2 - 2)', /nol/],
    ['2(x + 1', /Kurung tutup/],
    ['2x)', /berlebih/],
    ['3y + 1', /variabel x/],
    ['x^2', /Pangkat/],
    ['2 + ', /belum lengkap/],
    ['', /kosong/],
  ])('menolak "%s" dengan pesan yang jelas', (teks, pola) => {
    expect(() => parseLinear(teks)).toThrow(GalatParse);
    expect(() => parseLinear(teks)).toThrow(pola);
  });
});

describe('parsePertidaksamaan', () => {
  it('membaca semua bentuk tanda', () => {
    expect(parsePertidaksamaan('x < 1').op).toBe('<');
    expect(parsePertidaksamaan('x ≤ 1').op).toBe('<=');
    expect(parsePertidaksamaan('x >= 1').op).toBe('>=');
    expect(parsePertidaksamaan('x => 1').op).toBe('>=');
    expect(parsePertidaksamaan('x = 1').op).toBe('=');
  });

  it('menolak tanpa tanda atau dengan tanda berantai', () => {
    expect(() => parsePertidaksamaan('2x + 1')).toThrow(/Belum ada tanda/);
    expect(() => parsePertidaksamaan('1 < x < 5')).toThrow(/satu tanda/);
    expect(() => parsePertidaksamaan('< 5')).toThrow(/kosong/);
  });
});
