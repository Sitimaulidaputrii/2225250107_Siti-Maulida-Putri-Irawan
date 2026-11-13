import './styles/main.css';
import './styles/komponen.css';
import { registerSW } from 'virtual:pwa-register';
import { bukaKartuAturan } from './components/kartuAturan.js';
import { buatRouter } from './router.js';
import { beranda } from './views/beranda.js';
import { tentang, tidakDitemukan } from './views/lainnya.js';
import { modul } from './views/modul.js';

document.getElementById('tombol-aturan').addEventListener('click', bukaKartuAturan);

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
