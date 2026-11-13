/**
 * Menangani pemasangan PWA:
 * - Chrome/Edge/Android: tangkap `beforeinstallprompt`, tampilkan tombol sendiri.
 * - iOS Safari: tidak ada prompt otomatis, tampilkan panduan "Tambahkan ke Layar Utama".
 */
let promptTertunda = null;
const pendengar = new Set();

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  promptTertunda = e;
  pendengar.forEach((fn) => fn());
});

window.addEventListener('appinstalled', () => {
  promptTertunda = null;
  pendengar.forEach((fn) => fn());
});

export const sudahTerpasang = () =>
  window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

export const perangkatIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

export const bisaPromptInstal = () => promptTertunda !== null;

export async function mintaInstal() {
  if (!promptTertunda) return false;
  promptTertunda.prompt();
  const { outcome } = await promptTertunda.userChoice;
  promptTertunda = null;
  pendengar.forEach((fn) => fn());
  return outcome === 'accepted';
}

export function saatStatusInstalBerubah(fn) {
  pendengar.add(fn);
  return () => pendengar.delete(fn);
}
