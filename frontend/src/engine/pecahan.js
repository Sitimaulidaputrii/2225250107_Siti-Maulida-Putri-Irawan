/**
 * Bilangan rasional eksak (p/q) agar tidak ada galat desimal seperti 0.1 + 0.2.
 * Objek tidak dapat diubah (immutable); setiap operasi menghasilkan Pecahan baru.
 */

const fpb = (a, b) => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
};

function pastikanAman(n) {
  if (!Number.isSafeInteger(n)) throw new RangeError('Bilangan terlalu besar untuk dihitung secara tepat');
  return n;
}

export class Pecahan {
  constructor(p, q = 1) {
    if (!Number.isInteger(p) || !Number.isInteger(q)) {
      throw new TypeError('Pembilang dan penyebut harus bilangan bulat');
    }
    if (q === 0) throw new RangeError('Penyebut tidak boleh nol');
    if (q < 0) {
      p = -p;
      q = -q;
    }
    const g = fpb(p, q) || 1;
    this.p = pastikanAman(p / g) + 0; // "+ 0" mengubah -0 menjadi 0
    this.q = pastikanAman(q / g);
    Object.freeze(this);
  }

  /**
   * Membuat Pecahan dari: Pecahan, bilangan bulat, atau teks
   * "7", "-3", "−3", "3/4", "-3/4", "2,5", "2.5".
   */
  static dari(nilai) {
    if (nilai instanceof Pecahan) return nilai;
    if (typeof nilai === 'number') {
      if (Number.isInteger(nilai)) return new Pecahan(nilai);
      return Pecahan.dari(String(nilai));
    }
    if (typeof nilai !== 'string') throw new TypeError(`Tidak dapat dibaca sebagai bilangan: ${nilai}`);

    const teks = nilai.trim().replace(/[−–—]/g, '-').replace(/\s+/g, '');
    const m = /^([+-])?(\d+)(?:[.,](\d+))?(?:\/(\d+))?$/.exec(teks);
    if (!m || (m[3] !== undefined && m[4] !== undefined)) {
      throw new TypeError(`Tidak dapat dibaca sebagai bilangan: "${nilai}"`);
    }
    const tanda = m[1] === '-' ? -1 : 1;
    if (m[3] !== undefined) {
      const skala = 10 ** m[3].length;
      return new Pecahan(tanda * (Number(m[2]) * skala + Number(m[3])), skala);
    }
    return new Pecahan(tanda * Number(m[2]), m[4] !== undefined ? Number(m[4]) : 1);
  }

  tambah(lain) {
    const o = Pecahan.dari(lain);
    return new Pecahan(pastikanAman(this.p * o.q + o.p * this.q), pastikanAman(this.q * o.q));
  }

  kurang(lain) {
    return this.tambah(Pecahan.dari(lain).neg());
  }

  kali(lain) {
    const o = Pecahan.dari(lain);
    return new Pecahan(pastikanAman(this.p * o.p), pastikanAman(this.q * o.q));
  }

  bagi(lain) {
    const o = Pecahan.dari(lain);
    if (o.nol()) throw new RangeError('Tidak boleh membagi dengan nol');
    return new Pecahan(pastikanAman(this.p * o.q), pastikanAman(this.q * o.p));
  }

  neg() {
    return new Pecahan(-this.p, this.q);
  }

  /** -1, 0, atau 1 */
  tanda() {
    return Math.sign(this.p);
  }

  nol() {
    return this.p === 0;
  }

  bulat() {
    return this.q === 1;
  }

  sama(lain) {
    const o = Pecahan.dari(lain);
    return this.p === o.p && this.q === o.q;
  }

  /** -1 jika this < lain, 0 jika sama, 1 jika this > lain */
  banding(lain) {
    const o = Pecahan.dari(lain);
    return Math.sign(this.p * o.q - o.p * this.q);
  }

  /** Bilangan bulat terbesar yang ≤ nilai ini. */
  bawah() {
    return Math.floor(this.p / this.q);
  }

  /** Bilangan bulat terkecil yang ≥ nilai ini. */
  atas() {
    return Math.ceil(this.p / this.q);
  }

  keNumber() {
    return this.p / this.q;
  }

  /** "3", "-2", "3/4", "-1/2" — format yang juga dibaca oleh parser & SymPy. */
  toString() {
    return this.q === 1 ? String(this.p) : `${this.p}/${this.q}`;
  }
}

export const NOL = new Pecahan(0);
export const SATU = new Pecahan(1);
