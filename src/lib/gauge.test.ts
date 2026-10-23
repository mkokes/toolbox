import { describe, expect, it } from 'vitest'
import { GAUGE_START, GAUGE_SWEEP, arcPath, polar, rpmToAngle } from './gauge'

describe('rpmToAngle', () => {
  it('maps 0 to the start and max to the end of the sweep', () => {
    expect(rpmToAngle(0, 12000)).toBe(GAUGE_START)
    expect(rpmToAngle(12000, 12000)).toBe(GAUGE_START + GAUGE_SWEEP)
    expect(rpmToAngle(6000, 12000)).toBe(GAUGE_START + GAUGE_SWEEP / 2)
  })

  it('pins out-of-range values to the ends', () => {
    expect(rpmToAngle(-500, 12000)).toBe(GAUGE_START)
    expect(rpmToAngle(25000, 12000)).toBe(GAUGE_START + GAUGE_SWEEP)
  })
})

describe('polar', () => {
  it('measures clockwise from 3 o’clock in screen coordinates', () => {
    const right = polar(0, 0, 10, 0)
    const down = polar(0, 0, 10, 90)
    expect(right.x).toBeCloseTo(10)
    expect(right.y).toBeCloseTo(0)
    expect(down.x).toBeCloseTo(0)
    expect(down.y).toBeCloseTo(10)
  })
})

describe('arcPath', () => {
  it('uses the large-arc flag only for sweeps over 180°', () => {
    expect(arcPath(100, 100, 50, 135, 405)).toMatch(/A 50 50 0 1 1/)
    expect(arcPath(100, 100, 50, 0, 90)).toMatch(/A 50 50 0 0 1/)
  })
})
