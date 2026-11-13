/**
 * Latihan berjenjang dengan pemudaran bantuan (dokumen 04 §4.6):
 *   contoh → lengkapi1 (langkah kunci kosong) → lengkapi2 (+1 langkah kosong) → mandiri.
 * Langkah perantara yang kosong diisi dengan MEMILIH operasi; langkah terakhir diisi
 * lewat papan tanda. Di fase mandiri hanya jawaban akhir yang diminta.
 */
import { el } from '../dom.js';
import { catatJawaban, langkahDikosongkan, selesaiContoh } from '../engine/adaptif.js';
import { diagnosisJawaban } from '../engine/diagnosis.js';
import { acakBerbenih, buatSoal } from '../engine/generator.js';
import { parsePertidaksamaan } from '../engine/parser.js';
import { catatPercobaan } from '../penyimpanan.js';
import { tampilMatematika, teksRapi } from '../ui/matematika.js';
import { barisLangkah, langkahDemiLangkah } from './langkahDemiLangkah.js';
import { papanTanda } from './papanTanda.js';

const NAMA_FASE = {
  contoh: 'Contoh',
  lengkapi1: 'Lengkapi 1 langkah',
  lengkapi2: 'Lengkapi beberapa langkah',
  mandiri: 'Mandiri',
};
const SYARAT = { lengkapi1: 2, lengkapi2: 2, mandiri: 3 };

const LABEL_OPERASI = {
  tambah: (n) => `Tambahkan ${n} pada kedua ruas`,
  kurang: (n) => `Kurangi kedua ruas dengan ${n}`,
  kali: (n) => `Kalikan kedua ruas dengan ${n}`,
  bagi: (n) => `Bagi kedua ruas dengan ${n}`,
};
const LAWAN = { tambah: 'kurang', kurang: 'tambah', kali: 'bagi', bagi: 'kali' };

function acak(daftar, rng) {
  const a = [...daftar];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Opsi operasi untuk langkah perantara: 1 benar + pengecoh (operasi lawan, bilangan lain). */
export function opsiOperasi(langkah, i, rng = Math.random) {
  const { jenis, nilai } = langkah[i].operasi;
  const benar = { teks: LABEL_OPERASI[jenis](nilai), benar: true };
  const pengecoh = [{ teks: LABEL_OPERASI[LAWAN[jenis]](nilai), benar: false, kode: 'E4' }];
  try {
    const sebelum = parsePertidaksamaan(langkah[i - 1].ekspresi);
    const lain = sebelum.kanan.b.toString();
    if (lain !== nilai && lain !== '0') pengecoh.push({ teks: LABEL_OPERASI[jenis](lain), benar: false });
  } catch {
    /* abaikan: cukup satu pengecoh */
  }
  return acak([benar, ...pengecoh], rng).map((o) => ({ ...o, teks: teksRapi(o.teks) }));
}

/** Petunjuk bertingkat: pertanyaan pemandu → langkah kunci → contoh serupa. */
function teksPetunjuk(tingkat, langkah, indeksKosong) {
  const target = langkah[indeksKosong] ?? langkah.at(-1);
  if (tingkat === 1) {
    const awal = parsePertidaksamaan(langkah[Math.max(0, indeksKosong - 1)].ekspresi);
    if (!awal.kanan.a.nol()) return 'Ada suku x di kedua ruas. Kumpulkan dulu suku x di ruas kiri.';
    if (!awal.kiri.b.nol()) return 'Ada bilangan yang menempel pada x. Operasi apa yang menghilangkannya dari ruas kiri?';
    return 'x masih dikali suatu bilangan. Kedua ruas perlu dibagi berapa? Bilangan itu positif atau negatif?';
  }
  return `Langkah yang tepat: ${teksRapi(target.penjelasan)}`;
}

/**
 * @param {object} p
 * @param {object} p.status          status adaptif (lihat engine/adaptif.js)
 * @param {{level:number, hanya?:string}} p.pengaturan  pengaturan generator
 * @param {boolean} p.lewatiContoh   true bila bagian "Contoh" modul sudah selesai
 * @param {(status) => void} p.onSimpan
 * @param {() => void} p.onTuntas    dipanggil saat level target dikuasai
 * @param {string} p.idModul
 */
export function latihan({ status, pengaturan, lewatiContoh, onSimpan, onTuntas, idModul }) {
  const rng = acakBerbenih();
  const targetLevel = status.level;
  const wadah = el('div', { class: 'latihan' });
  const opsiGenerator = { hanya: pengaturan.hanya };

  if (status.fase === 'contoh' && lewatiContoh) {
    status = selesaiContoh(status).status;
    onSimpan(status);
  }

  function kepala() {
    const syarat = SYARAT[status.fase];
    return el('div', { class: 'latihan-kepala' },
      el('span', { class: 'lencana-fase' }, NAMA_FASE[status.fase]),
      syarat
        ? el('span', { class: 'titik-kemajuan', 'aria-label': `${status.benarBeruntun} dari ${syarat} benar berturut-turut` },
          ...Array.from({ length: syarat }, (_, i) => el('span', { class: i < status.benarBeruntun ? 'titik isi' : 'titik' })))
        : null);
  }

  function pesanPeristiwa(peristiwa) {
    return {
      naikFase: 'Bagus! Sekarang bantuannya dikurangi sedikit.',
      turunFase: 'Yuk, kita coba lagi dengan bantuan satu langkah dulu.',
      naikLevel: 'Hebat! Kamu sudah menguasai latihan ini. 🎉',
      tuntas: 'Hebat! Semua level sudah kamu kuasai. 🎉',
    }[peristiwa];
  }

  function terapkan(hasil) {
    status = hasil.status;
    onSimpan(status);
    return hasil.peristiwa;
  }

  function tampilContoh() {
    const soal = buatSoal(targetLevel, rng, opsiGenerator);
    const lanjut = el('button', {
      type: 'button',
      class: 'tombol',
      hidden: true,
      onclick: () => {
        terapkan(selesaiContoh(status));
        soalBaru();
      },
    }, 'Mulai berlatih →');
    wadah.replaceChildren(kepala(),
      el('p', { class: 'redup' }, 'Perhatikan contoh ini langkah demi langkah.'),
      langkahDemiLangkah({ langkah: soal.langkah, soal: soal.soal, onSelesai: () => (lanjut.hidden = false) }),
      lanjut);
  }

  function soalBaru() {
    if (status.fase === 'contoh') return tampilContoh();
    const soal = buatSoal(targetLevel, rng, opsiGenerator);
    const langkah = soal.langkah;
    const mandiri = status.fase === 'mandiri';
    const kosong = new Set(langkahDikosongkan(status.fase, langkah).filter((i) => langkah[i].operasi?.jenis !== 'uraikan' || i === langkah.length - 1));
    const terakhir = langkah.length - 1;

    let pakaiPetunjuk = false;
    let tingkatPetunjuk = 0;
    let sudahDinilai = false;
    let indeksAktif = mandiri ? terakhir : [...kosong].sort((a, b) => a - b)[0] ?? terakhir;

    const daftar = el('ol', { class: 'daftar-langkah' });
    const area = el('div', { class: 'latihan-area' });
    const umpan = el('div', { class: 'umpan', role: 'status', 'aria-live': 'polite', hidden: true });
    const kotakPetunjuk = el('div', { class: 'petunjuk', hidden: true });
    const tombolPetunjuk = el('button', { type: 'button', class: 'tombol tombol-kedua', onclick: mintaPetunjuk }, '💡 Petunjuk');
    const tombolBerikut = el('button', { type: 'button', class: 'tombol', hidden: true, onclick: soalBaru }, 'Soal berikutnya →');

    function mintaPetunjuk() {
      tingkatPetunjuk = Math.min(3, tingkatPetunjuk + 1);
      pakaiPetunjuk = true;
      kotakPetunjuk.hidden = false;
      const isi = [el('p', {}, teksPetunjuk(tingkatPetunjuk, langkah, indeksAktif))];
      if (tingkatPetunjuk >= 3) {
        const serupa = buatSoal(targetLevel, rng, opsiGenerator);
        isi.push(el('details', { open: true }, el('summary', {}, 'Contoh serupa'),
          el('ol', { class: 'daftar-langkah' }, ...serupa.langkah.map(barisLangkah))));
      }
      kotakPetunjuk.replaceChildren(...isi);
      tombolPetunjuk.textContent = tingkatPetunjuk < 2 ? '💡 Petunjuk lagi' : tingkatPetunjuk < 3 ? '📖 Contoh serupa' : '💡 Petunjuk';
      tombolPetunjuk.disabled = tingkatPetunjuk >= 3;
    }

    function tampilUmpan(benar, pesan) {
      umpan.hidden = false;
      umpan.className = benar ? 'umpan umpan-benar' : 'umpan umpan-cek';
      umpan.replaceChildren(el('p', { class: 'umpan-judul' }, benar ? 'Tepat! 🙂' : 'Hampir!'), ...(pesan ? [el('p', {}, teksRapi(pesan))] : []));
    }

    function renderLangkah() {
      const tampil = mandiri ? [langkah[0]] : langkah.slice(0, indeksAktif);
      daftar.replaceChildren(...tampil.map(barisLangkah));
    }

    function nilaiAkhir(benar, kode) {
      catatPercobaan({ modul: idModul, soal: soal.soal, level: targetLevel, fase: status.fase, benar, kode, pakaiPetunjuk });
      if (sudahDinilai) return null;
      sudahDinilai = true;
      return terapkan(catatJawaban(status, { benar, pakaiPetunjuk }));
    }

    function selesaiSoal(peristiwa) {
      area.replaceChildren();
      daftar.replaceChildren(...langkah.map(barisLangkah));
      tombolPetunjuk.hidden = true;
      kotakPetunjuk.hidden = true;
      if (peristiwa) {
        umpan.append(el('p', { class: 'umpan-peristiwa' }, pesanPeristiwa(peristiwa)));
      }
      if (peristiwa === 'naikLevel' || peristiwa === 'tuntas') {
        onTuntas();
        tombolBerikut.textContent = 'Latihan lagi';
      }
      tombolBerikut.hidden = false;
      tombolBerikut.focus();
    }

    function renderArea() {
      renderLangkah();
      if (indeksAktif === terakhir) {
        const papan = papanTanda({
          onKirim(jawaban) {
            const d = diagnosisJawaban(soal.soal, jawaban);
            if (d.benar) {
              tampilUmpan(true);
              selesaiSoal(nilaiAkhir(true, null));
            } else {
              const peristiwa = nilaiAkhir(false, d.kode);
              tampilUmpan(false, d.pesan);
              if (peristiwa === 'turunFase') {
                umpan.append(el('p', { class: 'umpan-peristiwa' }, pesanPeristiwa(peristiwa)));
                selesaiSoal(null);
              } else {
                papan.reset();
              }
            }
          },
        });
        area.replaceChildren(el('p', { class: 'latihan-tanya' }, mandiri ? 'Tuliskan himpunan penyelesaiannya:' : 'Lengkapi langkah terakhir:'), papan.el);
        return;
      }
      // Langkah perantara: pilih operasi yang tepat
      const opsi = opsiOperasi(langkah, indeksAktif, rng);
      const tombol = opsi.map((o) =>
        el('button', {
          type: 'button',
          class: 'opsi',
          onclick: (e) => {
            if (o.benar) {
              umpan.hidden = true;
              indeksAktif++;
              while (indeksAktif < terakhir && !kosong.has(indeksAktif)) indeksAktif++;
              renderArea();
            } else {
              e.currentTarget.classList.add('opsi-salah');
              e.currentTarget.disabled = true;
              tampilUmpan(false, o.kode === 'E4'
                ? 'Untuk menghilangkan suatu suku, pakai operasi kebalikannya: + dihilangkan dengan −, dan sebaliknya.'
                : 'Perhatikan bilangan yang menempel pada x di ruas kiri.');
            }
          },
        }, o.teks));
      area.replaceChildren(el('p', { class: 'latihan-tanya' }, 'Langkah berikutnya apa?'), el('div', { class: 'daftar-opsi' }, ...tombol));
    }

    wadah.replaceChildren(
      kepala(),
      el('p', { class: 'latihan-tanya' }, 'Selesaikan:'),
      el('div', { class: 'soal-besar', 'data-soal': soal.soal }, tampilMatematika(soal.soal, { besar: true })),
      daftar, area, umpan, kotakPetunjuk,
      el('div', { class: 'baris-tombol' }, tombolPetunjuk, tombolBerikut));
    // Selama langkah awal yang tidak kosong, tampilkan langsung
    if (!mandiri) while (indeksAktif < terakhir && !kosong.has(indeksAktif)) indeksAktif++;
    renderArea();
  }

  soalBaru();
  return wadah;
}
