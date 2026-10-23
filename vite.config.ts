import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves project sites from a sub-path (https://<user>.github.io/<repo>/).
// The deploy workflow sets BASE_PATH from actions/configure-pages; local dev stays at '/'.
const basePath = process.env.BASE_PATH

export default defineConfig({
  base: basePath ? basePath.replace(/\/?$/, '/') : '/',
  plugins: [react()],
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
})
