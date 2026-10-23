import { describe, expect, it } from 'vitest'
import { AA_LARGE_TEXT, AA_TEXT, contrast } from '../lib/contrast'
import { baseToken, brand, palettes, pageBackground } from './tokens'

const WHITE = baseToken.colorTextLightSolid as string

describe.each(['dark', 'light'] as const)('%s palette', (mode) => {
  const p = palettes[mode]
  const bg = pageBackground(mode)

  it('has readable body text', () => {
    expect(contrast(p.colorTextBase as string, bg)).toBeGreaterThanOrEqual(AA_TEXT)
  })

  it('has a readable accent green for results, title and links', () => {
    expect(contrast(brand[mode].colorAccent, bg)).toBeGreaterThanOrEqual(AA_TEXT)
    expect(contrast(p.colorLink as string, bg)).toBeGreaterThanOrEqual(AA_TEXT)
  })

  it('has headings readable as large text', () => {
    expect(contrast(brand[mode].colorHeading, bg)).toBeGreaterThanOrEqual(AA_LARGE_TEXT)
  })

  it('has readable muted text on the page and on tiles', () => {
    const muted = p.colorTextSecondary as string
    expect(contrast(muted, bg)).toBeGreaterThanOrEqual(AA_TEXT)
    expect(contrast(muted, p.colorBgContainer as string)).toBeGreaterThanOrEqual(AA_TEXT)
  })

  it('has the accent green readable on tiles', () => {
    expect(contrast(brand[mode].colorAccent, p.colorBgContainer as string)).toBeGreaterThanOrEqual(AA_TEXT)
  })

  it('keeps the gauge needle readable against the page', () => {
    expect(contrast(brand[mode].needle, bg)).toBeGreaterThanOrEqual(AA_LARGE_TEXT)
    expect(brand[mode].gaugeTrack).not.toBe(bg)
  })

  it('has readable white text on primary buttons', () => {
    expect(contrast(WHITE, p.colorPrimary as string)).toBeGreaterThanOrEqual(AA_TEXT)
  })
})

describe('contrast', () => {
  it('matches known WCAG values', () => {
    expect(contrast('#000000', '#FFFFFF')).toBeCloseTo(21)
    expect(contrast('#777777', '#777777')).toBeCloseTo(1)
  })
})
