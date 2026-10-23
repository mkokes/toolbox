import { theme } from 'antd'
import { describe, expect, it } from 'vitest'
import { getAntdTheme } from './antdTheme'
import { brand, palettes } from './tokens'

describe('getAntdTheme', () => {
  it('uses the dark algorithm only in dark mode', () => {
    expect(getAntdTheme('dark').algorithm).toBe(theme.darkAlgorithm)
    expect(getAntdTheme('light').algorithm).toBe(theme.defaultAlgorithm)
  })

  it.each(['dark', 'light'] as const)('resolves the %s palette into the design token', (mode) => {
    const t = theme.getDesignToken(getAntdTheme(mode))
    expect(t.colorBgLayout.toUpperCase()).toBe((palettes[mode].colorBgLayout as string).toUpperCase())
    // colorPrimary is a seed: antd's algorithms derive the shade they render from it, so check the seed passed in.
    expect(getAntdTheme(mode).token?.colorPrimary).toBe(palettes[mode].colorPrimary)
  })

  it('keeps the shared type, shape and spacing scale', () => {
    const t = theme.getDesignToken(getAntdTheme('dark'))
    expect(t.fontSize).toBe(16)
    expect(t.controlHeightLG).toBe(48)
    expect(t.borderRadiusLG).toBe(16)
    // The old 0.25 / 0.5 / 1 / 2 / 3rem spacing maps onto these.
    expect([t.marginXXS, t.marginXS, t.margin, t.marginXL, t.marginXXL]).toEqual([4, 8, 16, 32, 48])
  })

  it('gives the slider a thick rail and a big handle in both themes', () => {
    for (const mode of ['dark', 'light'] as const) {
      const slider = getAntdTheme(mode).components?.Slider
      expect(slider?.railSize).toBe(10)
      expect(slider?.handleSize).toBe(24)
    }
  })

  it('colors the slider with the accent green on dark and the primary red on light', () => {
    expect(getAntdTheme('dark').components?.Slider?.trackBg).toBe(brand.dark.colorAccent)
    expect(getAntdTheme('light').components?.Slider?.trackBg).toBe(palettes.light.colorPrimary)
  })
})
