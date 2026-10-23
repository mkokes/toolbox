import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

// Generates the favicon, PWA and Apple touch icons from public/icon.svg.
// Run `npm run icons` after changing the SVG, then commit the PNGs it writes to public/.
export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    ...minimal2023Preset,
    // Maskable and Apple icons can't be transparent; use the logo's white backdrop.
    maskable: { ...minimal2023Preset.maskable, resizeOptions: { background: '#FFFFFF' } },
    apple: { ...minimal2023Preset.apple, resizeOptions: { background: '#FFFFFF' } },
  },
  images: ['public/icon.svg'],
})
