import type { ManifestOptions } from 'vite-plugin-pwa'
import { colors } from './theme/tokens'

// Web app manifest. Paths are relative so the app installs correctly under the GitHub Pages sub-path.
// Icon files are generated from public/icon.svg by `npm run icons`.
export const manifest: Partial<ManifestOptions> = {
  name: 'Moped Toolbox',
  short_name: 'Moped Toolbox',
  description: 'Moped gearing and two-stroke fuel mixing calculators',
  id: './',
  start_url: './',
  scope: './',
  display: 'standalone',
  orientation: 'portrait',
  theme_color: colors.background,
  background_color: colors.background,
  categories: ['utilities', 'productivity'],
  icons: [
    { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
    { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
    { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
    { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
}
