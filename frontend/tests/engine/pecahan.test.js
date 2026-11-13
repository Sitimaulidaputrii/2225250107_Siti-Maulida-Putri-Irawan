import { describe, expect, it } from 'vitest';
import { Pecahan } from '../../src/engine/pecahan.js';

const P = Pecahan.dari;

describe('Pecahan', () => {
  it('menyederhanakan dan menormalkan tanda', () => {
    expect(new Pecahan(6, -4).toString()).toBe('-3/2');
    expect(new Pecahan(0, -5).toString()).toBe('0');
    expect(Object.is(new Pecahan(0, -5).p, -0)).toBe(false);
  });

  it('membaca berbagai bentuk teks', () => {
    expect(P('7').toString()).toBe('7');
    expect(P('−3').toString()).toBe('-3');
    expect(P('-3/4').toString()).toBe('-3/4');
    expect(P('2,5').toString()).toBe('5/2');
    expect(P('2.5').toString()).toBe('5/2');
    expect(P(' -0,25 ').toString()).toBe('-1/4');
    expect(P(0.5).toString()).toBe('1/2');
  });

  it('menolak teks yang bukan bilangan', () => {
    expect(() => P('abc')).toThrow();
    expect(() => P('2,5/3')).toThrow();
    expect(() => P('1/0')).toThrow();
  });

  it('aritmetika eksak (tidak ada galat 0,1 + 0,2)', () => {
    expect(P('0,1').tambah('0,2').sama('3/10')).toBe(true);
    expect(P('1/2').kurang('1/3').toString()).toBe('1/6');
    expect(P(-6).kali('-1/3').toString()).toBe('2');
    expect(P(6).bagi(-3).toString()).toBe('-2');
    expect(() => P(1).bagi(0)).toThrow();
  });

  it('membandingkan dan membulatkan', () => {
    expect(P('-1/2').banding('-1/3')).toBe(-1);
    expect(P(2).banding('4/2')).toBe(0);
    expect(P('19/2').bawah()).toBe(9);
    expect(P('-19/2').bawah()).toBe(-10);
    expect(P('-19/2').atas()).toBe(-9);
    expect(P(-3).tanda()).toBe(-1);
  });
});
