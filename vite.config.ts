import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { manifest } from './src/pwa'

// GitHub Pages serves project sites from a sub-path (https://<user>.github.io/<repo>/).
// The deploy workflow sets BASE_PATH from actions/configure-pages; local dev stays at '/'.
const basePath = process.env.BASE_PATH

export default defineConfig({
  base: basePath ? basePath.replace(/\/?$/, '/') : '/',
  plugins: [
    react(),
    VitePWA({
      // A new version waits in the background. src/pwaUpdates.ts applies it after an hour of idle time, and
      // it takes over anyway the next time the app is closed and reopened.
      registerType: 'prompt',
      injectRegister: false, // src/pwaUpdates.ts registers the worker
      includeAssets: ['favicon.ico', 'icon.svg', 'apple-touch-icon-180x180.png'],
      manifest,
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        runtimeCaching: [
          {
            // Google Fonts stylesheet for the Lobster title: serve cached, refresh in the background.
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-stylesheets' },
          },
          {
            // The font files themselves never change for a given URL.
            urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          antd: ['antd'],
        },
      },
    },
    // antd is a single large vendor chunk that rarely changes, so it caches well.
    chunkSizeWarningLimit: 1000,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
