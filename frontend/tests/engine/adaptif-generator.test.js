import { describe, expect, it } from 'vitest';
import {
  catatJawaban,
  langkahDikosongkan,
  selesaiContoh,
  statusAwal,
} from '../../src/engine/adaptif.js';
import { acakBerbenih, buatSoal } from '../../src/engine/generator.js';
import { ekuivalen, perluDisederhanakan, selesaikan } from '../../src/engine/penyelesai.js';

/** Menjalankan serangkaian jawaban, mengembalikan status akhir & daftar peristiwa. */
function jalankan(status, daftar) {
  const peristiwa = [];
  for (const jwb of daftar) {
    const r = catatJawaban(status, jwb);
    status = r.status;
    if (r.peristiwa) peristiwa.push(r.peristiwa);
  }
  return { status, peristiwa };
}
const B = { benar: true };
const S = { benar: false };
const BP = { benar: true, pakaiPetunjuk: true };

describe('adaptif — fading & naik level', () => {
  it('alur lengkap satu level: contoh → lengkapi1 → lengkapi2 → mandiri → naik level', () => {
    let { status } = selesaiContoh(statusAwal(1));
    expect(status.fase).toBe('lengkapi1');
    const r = jalankan(status, [B, B, B, B, B, B, B]);
    expect(r.peristiwa).toEqual(['naikFase', 'naikFase', 'naikLevel']);
    expect(r.status).toMatchObject({ level: 2, fase: 'contoh' });
  });

  it('jawaban di fase contoh diabaikan', () => {
    expect(catatJawaban(statusAwal(1), B).status.fase).toBe('contoh');
  });

  it('salah memutus rangkaian benar', () => {
    const { status } = jalankan({ ...statusAwal(1), fase: 'lengkapi1' }, [B, S, B]);
    expect(status).toMatchObject({ fase: 'lengkapi1', benarBeruntun: 1 });
  });

  it('di fase mandiri, benar dengan petunjuk tidak dihitung', () => {
    const { status, peristiwa } = jalankan({ ...statusAwal(2), fase: 'mandiri' }, [B, B, BP, B, B]);
    expect(peristiwa).toEqual([]);
    expect(status.benarBeruntun).toBe(2);
  });

  it('di fase lengkapi, petunjuk boleh dipakai', () => {
    const { peristiwa } = jalankan({ ...statusAwal(2), fase: 'lengkapi1' }, [BP, BP]);
    expect(peristiwa).toEqual(['naikFase']);
  });

  it('salah 2× berturut-turut di mandiri → turun ke lengkapi2', () => {
    const { status, peristiwa } = jalankan({ ...statusAwal(3), fase: 'mandiri' }, [S, S]);
    expect(peristiwa).toEqual(['turunFase']);
    expect(status).toMatchObject({ level: 3, fase: 'lengkapi2', salahBeruntun: 0 });
  });

  it('level 5 mandiri tuntas', () => {
    const { status, peristiwa } = jalankan({ ...statusAwal(5), fase: 'mandiri' }, [B, B, B, B]);
    expect(peristiwa).toEqual(['tuntas']);
    expect(status.tuntas).toBe(true);
  });

  it('langkahDikosongkan', () => {
    const langkah = [{}, {}, { kunci: true }];
    expect(langkahDikosongkan('contoh', langkah)).toEqual([]);
    expect(langkahDikosongkan('lengkapi1', langkah)).toEqual([2]);
    expect(langkahDikosongkan('lengkapi2', langkah)).toEqual([1, 2]);
    expect(langkahDikosongkan('mandiri', langkah)).toEqual([1, 2]);
    expect(langkahDikosongkan('lengkapi2', [{}, { kunci: true }, {}])).toEqual([1, 2]);
  });
});

describe('generator soal acak', () => {
  it('benih yang sama menghasilkan soal yang sama', () => {
    expect(buatSoal(3, acakBerbenih(42)).soal).toBe(buatSoal(3, acakBerbenih(42)).soal);
  });

  it('menolak level tanpa generator', () => {
    expect(() => buatSoal(5)).toThrow();
  });

  for (const level of [1, 2, 3, 4]) {
    it(`level ${level}: 300 soal — jawaban bulat, kunci & langkah konsisten, ciri level terpenuhi`, () => {
      const rng = acakBerbenih(1000 + level);
      for (let i = 0; i < 300; i++) {
        const s = buatSoal(level, rng);
        const h = selesaikan(s.soal);
        expect(h.jenis, s.soal).toBe('batas');
        expect(h.nilai.bulat(), s.soal).toBe(true);
        expect(`${h.tanda} ${h.nilai}`).toBe(`${s.jawaban.tanda} ${s.jawaban.nilai}`);
        for (const l of s.langkah) expect(ekuivalen(l.ekspresi, s.soal), `${s.soal} :: ${l.ekspresi}`).toBe(true);
        if (level <= 2) expect(h.dibalik, s.soal).toBe(false);
        if (level === 3) expect(h.dibalik, s.soal).toBe(true);
        if (level === 1) expect(s.langkah.length, s.soal).toBe(2);
        if (level === 4) expect(perluDisederhanakan(s.soal) || /x.*[<>=].*x/.test(s.soal), s.soal).toBe(true);
      }
    });
  }
});
