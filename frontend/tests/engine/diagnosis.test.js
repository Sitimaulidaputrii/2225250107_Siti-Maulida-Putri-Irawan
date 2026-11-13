import { describe, expect, it } from 'vitest';
import {
  diagnosisGaris,
  diagnosisJawaban,
  diagnosisModel,
  diagnosisTafsiran,
  nilaiBulatEkstrem,
} from '../../src/engine/diagnosis.js';
import { selesaikan } from '../../src/engine/penyelesai.js';

const j = (tanda, nilai) => ({ tanda, nilai });
const kode = (soal, jawaban, opsi) => diagnosisJawaban(soal, jawaban, opsi).kode;

describe('diagnosisJawaban — tabel miskonsepsi dokumen 04 §4.5', () => {
  it('benar', () => {
    const h = diagnosisJawaban('-2x > 8', j('<', '-4'));
    expect(h.benar).toBe(true);
    expect(h.kode).toBeNull();
    expect(diagnosisJawaban('-2x > 8', j('<', '−4')).benar).toBe(true);
  });

  it('E1 — lupa membalik tanda', () => {
    const h = diagnosisJawaban('-2x > 8', j('>', '-4'));
    expect(h.kode).toBe('E1');
    expect(h.pesan).toContain('negatif');
    expect(kode('-3x + 5 <= 11', j('<=', -2))).toBe('E1');
    expect(kode('7 - x < 10', j('<', -3))).toBe('E1');
  });

  it('E2 — membalik tanda padahal membagi bilangan positif', () => {
    expect(kode('2x + 3 > 9', j('<', 3))).toBe('E2');
  });

  it('E3 — salah hitung dengan arah tanda benar', () => {
    const h = diagnosisJawaban('-2x > 8', j('<', 4));
    expect(h.kode).toBe('E3');
    expect(h.pesan).toContain('positif/negatif');
    expect(kode('4x - 7 <= 13', j('<=', 6))).toBe('E3');
  });

  it('E4 — memindahkan suku tanpa mengganti tanda', () => {
    expect(kode('x + 5 > 12', j('>', 17))).toBe('E4');
    // 3x dan −2 sama-sama dipindah tanpa ganti tanda: 8x ≥ 4 → x ≥ 1/2
    expect(kode('5x - 2 >= 3x + 6', j('>=', '1/2'))).toBe('E4');
  });

  it('E5 — termasuk/tidak termasuk tertukar', () => {
    expect(kode('-2x > 8', j('<=', -4))).toBe('E5');
  });

  it('kesalahan ganda menghasilkan LAIN dengan pesan umum', () => {
    expect(kode('-2x > 8', j('>', 4))).toBe('LAIN');
  });

  it('memakai salah_umum dari bank soal', () => {
    expect(kode('x + 5 > 12', j('<', 99), { salahUmum: [{ kode: 'E7', jawaban: j('<', '99') }] })).toBe('E7');
  });

  it('E1 tetap memakai pesan otomatis walau tercantum di salah_umum', () => {
    const h = diagnosisJawaban('-2x > 8', j('>', -4), { salahUmum: [{ kode: 'E1', jawaban: j('>', '-4') }] });
    expect(h.kode).toBe('E1');
    expect(h.pesan).toContain('−2');
  });
});

describe('diagnosisGaris', () => {
  const g = (nilai, bulatan, arah) => ({ nilai, bulatan, arah });
  it('benar', () => expect(diagnosisGaris('x < -4', g(-4, 'terbuka', 'kiri')).benar).toBe(true));
  it('E3 titik salah', () => expect(diagnosisGaris('x < -4', g(4, 'terbuka', 'kiri')).kode).toBe('E3'));
  it('E5 bulatan salah', () => expect(diagnosisGaris('x < -4', g(-4, 'tertutup', 'kiri')).kode).toBe('E5'));
  it('E6 arah salah', () => expect(diagnosisGaris('x < -4', g(-4, 'terbuka', 'kanan')).kode).toBe('E6'));
  it('melaporkan satu kesalahan saja (bulatan dulu)', () =>
    expect(diagnosisGaris('x >= 2', g(2, 'terbuka', 'kiri')).kode).toBe('E5'));
});

describe('diagnosisModel (soal cerita)', () => {
  const kunci = '14000 + 4000x <= 50000';
  it('model ekuivalen dengan bentuk berbeda tetap benar', () => {
    expect(diagnosisModel(kunci, '4000x + 14000 <= 50000').benar).toBe(true);
    expect(diagnosisModel(kunci, '4000x <= 36000').benar).toBe(true);
  });
  it('E7 — "paling banyak" ditulis ≥', () => {
    const h = diagnosisModel(kunci, '14000 + 4000x >= 50000');
    expect(h.kode).toBe('E7');
    expect(h.pesan).toContain('paling banyak');
  });
  it('E7 — hubungan besaran salah', () => {
    expect(diagnosisModel(kunci, '4000 + 14000x <= 50000').kode).toBe('E7');
  });
});

describe('tafsiran & semesta (E8)', () => {
  it('nilaiBulatEkstrem', () => {
    expect(nilaiBulatEkstrem(selesaikan('x <= 19/2'))).toBe(9);
    expect(nilaiBulatEkstrem(selesaikan('x < 9'))).toBe(8);
    expect(nilaiBulatEkstrem(selesaikan('x >= 82.5'))).toBe(83);
    expect(nilaiBulatEkstrem(selesaikan('x > 5'))).toBe(6);
    expect(nilaiBulatEkstrem(selesaikan('x > -5/2'))).toBe(-2);
  });

  it('soal buku: paling banyak 9 buku', () => {
    const h = selesaikan('14000 + 4000x <= 50000');
    expect(diagnosisTafsiran(h, 'cacah', 9).benar).toBe(true);
    expect(diagnosisTafsiran(h, 'cacah', 8).kode).toBe('E3');
  });

  it('E8 — jawaban bukan bilangan cacah', () => {
    const h = selesaikan('4000x <= 38000'); // x ≤ 9,5
    expect(diagnosisTafsiran(h, 'cacah', '9,5').kode).toBe('E8');
    expect(diagnosisTafsiran(h, 'cacah', 9).benar).toBe(true);
  });

  it('E8 — batas tidak termasuk pada tanda <', () => {
    const h = selesaikan('x < 9');
    expect(diagnosisTafsiran(h, 'cacah', 9).kode).toBe('E8');
    expect(diagnosisTafsiran(h, 'cacah', 8).benar).toBe(true);
  });

  it('semesta cacah tanpa anggota', () => {
    expect(diagnosisTafsiran(selesaikan('x <= -1'), 'cacah', 0).kode).toBe('LAIN');
  });
});
