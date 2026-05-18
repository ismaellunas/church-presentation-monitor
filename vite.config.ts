import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// `VITE_BASE` lets the same build target root-served hosts (Vercel/Netlify/Cloudflare)
// and GitHub Pages at `/<repo>/` without code changes.
const base = process.env.VITE_BASE ?? '/';

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'GEWCI Stage Monitor',
        short_name: 'Stage Monitor',
        description:
          'On-stage countdown and screen mirror for GEWCI services. Cast to a TV via Chromecast.',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'landscape',
        start_url: '.',
        scope: '.',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        // Skip workbox's internal terser pass — it uses the deprecated
        // rollup-plugin-terser whose worker threads can hang on Vite 6.
        // The SW itself is tiny so unminified is fine.
        mode: 'development',
      },
    }),
  ],
});
