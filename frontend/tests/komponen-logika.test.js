import { describe, expect, it } from 'vitest';
import { keadaanAwal, ketik, validasi } from '../src/components/papanTanda.js';
import { opsiOperasi } from '../src/components/latihan.js';
import { nilaiUji } from '../src/components/langkahDemiLangkah.js';
import { langkahPenyelesaian, memenuhi } from '../src/engine/penyelesai.js';
import { teksRapi, verbalisasi } from '../src/ui/matematika.js';

const tekanSemua = (tombol, k = keadaanAwal()) => tombol.reduce(ketik, k);

describe('papan tanda — logika masukan', () => {
  it('menyusun jawaban x ≥ −2', () => {
    expect(tekanSemua(['>=', '2', 'negatif'])).toEqual({ tanda: '>=', nilai: '-2' });
  });

  it('nol di depan diganti', () => {
    expect(tekanSemua(['0', '5']).nilai).toBe('5');
    expect(tekanSemua(['negatif', '0', '7']).nilai).toBe('-7');
  });

  it('koma & pecahan hanya sekali dan tidak bersamaan', () => {
    expect(tekanSemua(['2', ',', '5', ',', '/']).nilai).toBe('2,5');
    expect(tekanSemua(['3', '/', '4', '/', ',']).nilai).toBe('3/4');
    expect(tekanSemua([',']).nilai).toBe('');
  });

  it('hapus: angka dulu, lalu tanda', () => {
    expect(tekanSemua(['<', '1', 'hapus'])).toEqual({ tanda: '<', nilai: '' });
    expect(tekanSemua(['<', 'hapus'])).toEqual({ tanda: null, nilai: '' });
  });

  it('validasi', () => {
    expect(validasi(tekanSemua(['5'])).ok).toBe(false);
    expect(validasi(tekanSemua(['5']), { perluTanda: false }).ok).toBe(true);
    expect(validasi(tekanSemua(['<', '3', '/'])).ok).toBe(false);
    expect(validasi(tekanSemua(['<', '3', '/', '0'])).ok).toBe(false);
    const v = validasi(tekanSemua(['<', '2', ',', '5']));
    expect(v.ok).toBe(true);
    expect(v.jawaban.nilai.toString()).toBe('5/2');
  });
});

describe('tampilan matematika', () => {
  it('teksRapi mengganti minus dan tanda', () => {
    expect(teksRapi('Bagi kedua ruas dengan -3 (negatif)')).toBe('Bagi kedua ruas dengan −3 (negatif)');
    expect(teksRapi('x >= -2')).toBe('x ≥ −2');
    expect(teksRapi('12 - 5')).toBe('12 - 5');
  });

  it('verbalisasi untuk pembaca layar', () => {
    expect(verbalisasi('-3x <= 6')).toBe('minus 3x kurang dari atau sama dengan 6');
  });
});

describe('opsi operasi (mode langkah)', () => {
  it('selalu memuat tepat satu opsi benar dan pengecoh operasi lawan', () => {
    const langkah = langkahPenyelesaian('-3x + 5 <= 11');
    const opsi = opsiOperasi(langkah, 1, () => 0.3);
    expect(opsi.filter((o) => o.benar)).toHaveLength(1);
    expect(opsi.find((o) => o.benar).teks).toBe('Kurangi kedua ruas dengan 5');
    expect(opsi.some((o) => o.kode === 'E4' && o.teks === 'Tambahkan 5 pada kedua ruas')).toBe(true);
    expect(new Set(opsi.map((o) => o.teks)).size).toBe(opsi.length);
  });
});

describe('nilai uji untuk cek substitusi', () => {
  it.each(['x + 5 > 12', '-3x + 5 <= 11', 'x - 4 <= -1', '-2x > 8', '2x < 3', 'x > -5/2'])(
    '%s: nilai uji memenuhi', (soal) => expect(memenuhi(soal, nilaiUji(soal))).toBe(true));
});
