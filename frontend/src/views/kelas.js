/**
 * Bagian "Kelas" di Pengaturan: siswa bergabung ke kelas dengan kode dari guru,
 * nama panggilan, dan PIN 4 digit (tanpa email — NF7).
 */
import { GalatApi, ambilSesi, panggil, simpanSesi } from '../api.js';
import { el } from '../dom.js';
import { KELAS_BAWAAN, simpanPengaturanKelas } from '../pengaturan.js';
import { ambilSemuaPercobaan } from '../penyimpanan.js';
import { sinkronkan } from '../sync.js';

function isian(label, atribut) {
  const input = el('input', { class: 'isian', autocomplete: 'off', ...atribut });
  return { input, el: el('label', { class: 'label-isian' }, el('span', {}, label), input) };
}

/** Memeriksa masukan formulir gabung kelas; mengembalikan pesan galat atau null. */
export function validasiGabung({ kode, nama, pin }) {
  if (!/^[A-Z0-9]{6}$/.test(kode)) return 'Kode kelas terdiri dari 6 huruf/angka.';
  if (nama.length < 2 || nama.length > 20) return 'Nama panggilan 2–20 karakter.';
  if (!/^\d{4}$/.test(pin)) return 'PIN harus 4 angka.';
  return null;
}

export function bagianKelas() {
  const wadah = el('section', { class: 'kartu' });

  async function render() {
    const sesi = await ambilSesi();
    if (sesi?.token && sesi.kelas) return renderTergabung(sesi);
    return renderGabung(sesi);
  }

  function renderGabung(sesi) {
    const kode = isian('Kode kelas (dari guru)', { maxlength: '6', autocapitalize: 'characters', placeholder: 'mis. K7Q2PX' });
    const nama = isian('Nama panggilan', { maxlength: '20', placeholder: 'mis. Nadia', value: sesi?.namaPanggilan ?? '' });
    const pin = isian('PIN 4 angka (ingat baik-baik)', { maxlength: '4', inputmode: 'numeric', type: 'password', placeholder: '••••' });
    if (sesi?.kelas?.kode) kode.input.value = sesi.kelas.kode;
    const pesan = el('p', { class: 'papan-pesan', role: 'status' });

    async function kirim(jenis) {
      const data = { kode: kode.input.value.trim().toUpperCase(), nama: nama.input.value.trim(), pin: pin.input.value.trim() };
      const galat = validasiGabung(data);
      if (galat) {
        pesan.textContent = galat;
        return;
      }
      pesan.textContent = 'Menghubungi server…';
      try {
        const r = await panggil(`/auth/siswa/${jenis}`, {
          metode: 'POST',
          isi: { kode_kelas: data.kode, nama_panggilan: data.nama, pin: data.pin },
        });
        await simpanSesi({ token: r.token, namaPanggilan: r.siswa.nama_panggilan, kelas: r.kelas });
        await simpanPengaturanKelas(r.kelas.pengaturan);
        sinkronkan();
        render();
      } catch (e) {
        pesan.textContent = e instanceof GalatApi ? e.message : 'Terjadi kesalahan.';
      }
    }

    wadah.replaceChildren(
      el('h2', {}, 'Kelas'),
      sesi?.perluMasuk ? el('p', { class: 'umpan umpan-cek' }, 'Sesimu sudah berakhir. Masuk lagi dengan nama dan PIN yang sama.') : null,
      el('p', { class: 'redup' }, 'Opsional. Bergabung ke kelas agar guru dapat melihat kemajuanmu. Tanpa email, tanpa nama lengkap.'),
      kode.el, nama.el, pin.el, pesan,
      el('div', { class: 'baris-tombol' },
        el('button', { type: 'button', class: 'tombol', onclick: () => kirim('gabung') }, 'Gabung kelas'),
        el('button', { type: 'button', class: 'tombol tombol-kedua', onclick: () => kirim('masuk') }, 'Sudah pernah gabung')),
      el('p', { class: 'petunjuk-kecil' }, 'Pakai "Sudah pernah gabung" jika berganti HP.'));
  }

  async function renderTergabung(sesi) {
    const status = el('p', { class: 'redup', role: 'status' });
    const perbaruiStatus = async () => {
      const belum = (await ambilSemuaPercobaan()).filter((p) => !p.tersinkron).length;
      status.textContent = belum ? `${belum} jawaban menunggu dikirim.` : 'Semua jawaban sudah terkirim ✔';
    };
    let yakin = false;
    const tombolKeluar = el('button', {
      type: 'button',
      class: 'tautan',
      onclick: async () => {
        if (!yakin) {
          yakin = true;
          tombolKeluar.textContent = 'Ketuk sekali lagi untuk keluar dari kelas';
          return;
        }
        await simpanSesi(null);
        await simpanPengaturanKelas(KELAS_BAWAAN);
        render();
      },
    }, 'Keluar dari kelas');

    wadah.replaceChildren(
      el('h2', {}, 'Kelas'),
      el('p', {}, 'Tergabung di ', el('strong', {}, sesi.kelas.nama), ` (${sesi.kelas.kode}) sebagai `, el('strong', {}, sesi.namaPanggilan), '.'),
      status,
      el('button', {
        type: 'button',
        class: 'tombol tombol-kedua',
        onclick: async () => {
          status.textContent = 'Mengirim…';
          const r = await sinkronkan();
          if (r.galat) status.textContent = r.galat;
          else await perbaruiStatus();
        },
      }, 'Kirim sekarang'),
      tombolKeluar);
    perbaruiStatus();
  }

  render();
  return wadah;
}
