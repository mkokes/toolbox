import { describe, expect, it } from 'vitest'
import { GAUGE_START, GAUGE_SWEEP, arcPath, polar, progressArcPath, rpmToAngle } from './gauge'

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

const end = (cx: number, cy: number, r: number, deg: number) => {
  const { x, y } = polar(cx, cy, r, deg)
  return `${x.toFixed(2)} ${y.toFixed(2)}`
}

describe('progressArcPath', () => {
  const max = 12000

  it('has no length at zero or below, so there is nothing to draw', () => {
    expect(progressArcPath(100, 100, 50, 0, max)).toBeNull()
    expect(progressArcPath(100, 100, 50, -500, max)).toBeNull()
  })

  it('starts at the dial start and ends at the needle angle', () => {
    const path = progressArcPath(100, 100, 50, 6000, max)!
    expect(path.startsWith(`M ${end(100, 100, 50, GAUGE_START)}`)).toBe(true)
    expect(path.endsWith(end(100, 100, 50, rpmToAngle(6000, max)))).toBe(true)
  })

  it('uses the large-arc flag past halfway of a 270° sweep', () => {
    expect(progressArcPath(100, 100, 50, 11000, max)).toMatch(/A 50 50 0 1 1/)
    expect(progressArcPath(100, 100, 50, 2000, max)).toMatch(/A 50 50 0 0 1/)
  })

  it('pins values above the dial maximum to the full sweep', () => {
    expect(progressArcPath(100, 100, 50, 25000, max)).toBe(progressArcPath(100, 100, 50, max, max))
  })

  it('never produces NaN', () => {
    for (const rpm of [1, 6662, 12000, 14999, 1e9]) expect(progressArcPath(100, 100, 50, rpm, max)).not.toMatch(/NaN/)
  })
})
