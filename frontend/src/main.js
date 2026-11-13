import './styles/main.css';
import { registerSW } from 'virtual:pwa-register';
import { buatRouter } from './router.js';
import { beranda } from './views/beranda.js';
import { modul, tentang, tidakDitemukan } from './views/lainnya.js';

buatRouter(
  { beranda, modul, tentang, tidakDitemukan },
  document.getElementById('app'),
);

// --- Status jaringan ---
const lencana = document.getElementById('status-jaringan');
const perbaruiJaringan = () => (lencana.hidden = navigator.onLine);
window.addEventListener('online', perbaruiJaringan);
window.addEventListener('offline', perbaruiJaringan);
perbaruiJaringan();

// --- Service worker & pemberitahuan versi baru ---
const toast = document.getElementById('pesan-pembaruan');
const perbaruiSW = registerSW({
  onNeedRefresh() {
    toast.hidden = false;
  },
});
document.getElementById('tombol-muat-ulang').addEventListener('click', () => perbaruiSW(true));

// --- Minta penyimpanan permanen agar progres tidak dihapus browser ---
navigator.storage?.persist?.().catch(() => {});
