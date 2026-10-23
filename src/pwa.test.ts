import { describe, expect, it } from 'vitest'
import { manifest } from './pwa'
import { pageBackground } from './theme/tokens'

// Files that will be served from the site root (public/), as seen by Vite.
const publicFiles = Object.keys(import.meta.glob('../public/*', { query: '?url' })).map((p) =>
  p.replace('../public/', ''),
)

describe('web app manifest', () => {
  it('points every icon at a file in public/', () => {
    for (const icon of manifest.icons ?? []) expect(publicFiles).toContain(icon.src)
  })

  it('has the 192px and 512px icons browsers require to install, plus a maskable one', () => {
    const icons = manifest.icons ?? []
    expect(icons.some((i) => i.sizes === '192x192')).toBe(true)
    expect(icons.some((i) => i.sizes === '512x512' && !i.purpose)).toBe(true)
    expect(icons.some((i) => i.purpose === 'maskable')).toBe(true)
  })

  it('uses relative URLs so it works under the GitHub Pages sub-path', () => {
    for (const url of [manifest.start_url, manifest.scope, manifest.id, ...(manifest.icons ?? []).map((i) => i.src)]) {
      expect(url).not.toMatch(/^\//)
    }
  })

  it('takes its colors from the theme tokens', () => {
    expect(manifest.theme_color).toBe(pageBackground('dark'))
    expect(manifest.background_color).toBe(pageBackground('dark'))
  })

  it('opens as a standalone app', () => {
    expect(manifest.display).toBe('standalone')
    expect(manifest.name).toBe('Moped Toolbox')
  })
})
