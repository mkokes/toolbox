import { describe, expect, it } from 'vitest'
import indexHtml from '../../index.html?raw'
import { pageBackground } from './tokens'

// index.html applies the theme background before React loads, so it has to hard-code the two page colors.
describe('index.html pre-React theme script', () => {
  it.each(['dark', 'light'] as const)('uses the %s page background from the tokens', (mode) => {
    expect(indexHtml).toContain(`'${pageBackground(mode)}'`)
  })

  it('declares a theme-color for each scheme', () => {
    expect(indexHtml).toMatch(/name="theme-color"[^>]*media="\(prefers-color-scheme: light\)"/)
    expect(indexHtml).toMatch(/name="theme-color"[^>]*media="\(prefers-color-scheme: dark\)"/)
  })

  it('reads the same storage key as the theme context', () => {
    expect(indexHtml).toContain("localStorage.getItem('toolbox.theme')")
  })
})
