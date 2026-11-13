import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { readFileSync } from 'node:fs';

const paket = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'));

export default defineConfig({
  define: {
    __VERSI_APLIKASI__: JSON.stringify(paket.version),
  },
  server: {
    // Saat pengembangan, permintaan /api diteruskan ke FastAPI.
    proxy: { '/api': 'http://localhost:8000' },
  },
  plugins: [
    VitePWA({
      registerType: 'prompt', // tampilkan "Versi baru tersedia" alih-alih muat ulang paksa
      includeAssets: ['icons/apple-touch-icon.png', 'konten/*.json'],
      manifest: {
        name: 'TandaTepat — Belajar PtLSV',
        short_name: 'TandaTepat',
        description: 'Belajar pertidaksamaan linear satu variabel langkah demi langkah.',
        lang: 'id',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#FFFFFF',
        theme_color: '#1D4ED8',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,json,woff2}'],
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            // Konten materi & soal: pakai cache dulu, perbarui di latar.
            urlPattern: ({ url }) => url.pathname.startsWith('/konten/'),
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'konten' },
          },
          {
            // API hanya lewat jaringan; saat offline, aplikasi memakai data lokal.
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
});
