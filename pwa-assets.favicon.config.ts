import { defineConfig } from '@vite-pwa/assets-generator/config'

// Generates favicon.ico from the simplified public/favicon.svg, so the tab icon stays readable at 16px.
// Run through `npm run icons`, which also runs pwa-assets.config.ts for the PWA and Apple touch icons.
export default defineConfig({
  preset: {
    transparent: { sizes: [], favicons: [[48, 'favicon.ico']] },
    maskable: { sizes: [] },
    apple: { sizes: [] },
  },
  images: ['public/favicon.svg'],
})
