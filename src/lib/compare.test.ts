import { describe, expect, it } from 'vitest'
import { compareGearing, shiftOption } from './compare'
import type { Drivetrain } from './setup'

const E50_RATIO = 0.1980198019802
const stock: Drivetrain = { front: 16, rear: 45, wheel: 17, tire: 2.25 }
const opts = { mph: 30, targetRpm: 8000 }

describe('compareGearing', () => {
  it('reports no difference for identical gearing', () => {
    const c = compareGearing(E50_RATIO, stock, stock, opts)
    expect(c.ratio.alt).toBe(c.ratio.base)
    expect(c.rpm.alt).toBe(c.rpm.base)
    expect(c.topSpeedMph.alt).toBe(c.topSpeedMph.base)
  })

  it('gives the stock E50 figures for the base', () => {
    const c = compareGearing(E50_RATIO, stock, stock, opts)
    expect(c.ratio.base.toFixed(2)).toBe('14.20')
    expect(c.rpm.base).toBe(6662)
    expect(c.topSpeedMph.base).toBeCloseTo(36.03, 2)
  })

  it('shows a bigger rear sprocket revving higher and topping out lower', () => {
    const c = compareGearing(E50_RATIO, stock, { ...stock, rear: 47 }, opts)
    expect(c.ratio.alt.toFixed(2)).toBe('14.83')
    expect(c.rpm.alt).toBe(6958)
    expect(c.topSpeedMph.alt).toBeCloseTo(34.49, 2)
  })

  it('shows a bigger front sprocket revving lower and going faster', () => {
    const c = compareGearing(E50_RATIO, stock, { ...stock, front: 17 }, opts)
    expect(c.rpm.alt).toBeLessThan(c.rpm.base)
    expect(c.topSpeedMph.alt).toBeGreaterThan(c.topSpeedMph.base)
  })
})

describe('shiftOption', () => {
  const values = [20, 21, 22, 23]

  it('moves by positions in the list', () => {
    expect(shiftOption(values, 21, 2)).toBe(23)
    expect(shiftOption(values, 22, -1)).toBe(21)
  })

  it('stops at the ends', () => {
    expect(shiftOption(values, 22, 5)).toBe(23)
    expect(shiftOption(values, 21, -5)).toBe(20)
  })

  it('leaves values that are not in the list alone', () => {
    expect(shiftOption(values, 99, 1)).toBe(99)
  })

  it('steps Vespa pulleys by size, not by millimetre', () => {
    expect(shiftOption([55, 60, 65, 70], 60, 1)).toBe(65)
  })
})
