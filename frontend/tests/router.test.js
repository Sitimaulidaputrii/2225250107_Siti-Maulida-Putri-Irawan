import { describe, expect, it } from 'vitest';
import { parseRute } from '../src/router.js';

describe('parseRute', () => {
  it('hash kosong menuju beranda', () => {
    expect(parseRute('')).toEqual({ nama: 'beranda', param: [] });
    expect(parseRute('#/')).toEqual({ nama: 'beranda', param: [] });
  });

  it('membaca nama rute dan parameter', () => {
    expect(parseRute('#/modul/M4')).toEqual({ nama: 'modul', param: ['M4'] });
  });

  it('mengabaikan garis miring di akhir', () => {
    expect(parseRute('#/tentang/')).toEqual({ nama: 'tentang', param: [] });
  });
});
