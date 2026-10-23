import { describe, expect, it } from 'vitest'
import { findEngine } from '../data/engines'
import { calcMph, calcRpm, finalRatio, tireCircumference } from './gearing'

// The original toolbox's pi approximation; the port must keep it.
// oxlint-disable-next-line oxc/approx-constant
const LEGACY_PI = 3.14159

// The original jQuery toolbox's formulas, kept here to prove the port gives identical results.
const legacy = {
  tireCirc: (whl: number, tire: number) => (tire * 2 + whl) * LEGACY_PI,
  rpm: (intRatio: number, extRatio: number, mph: number, tireCirc: number) =>
    Math.round(((mph / 60) * 63360) / tireCirc / extRatio / intRatio),
}

const e50 = findEngine('Puch', 'E50')!
const external = e50.defaultfront / e50.defaultrear
const circumference = tireCircumference(e50.defaultwheel, e50.defaulttire)

describe('tireCircumference', () => {
  it('adds the tire sidewall twice to the rim diameter', () => {
    expect(tireCircumference(17, 2.25)).toBeCloseTo((17 + 4.5) * LEGACY_PI, 10)
  })
})

describe('finalRatio', () => {
  it('gives 14.20:1 for a stock Puch E50 (16/45)', () => {
    expect(finalRatio(e50.finaldriveratio, external).toFixed(2)).toBe('14.20')
  })
})

describe('calcRpm', () => {
  it('gives 6662 rpm for a stock Puch E50 at 30 mph', () => {
    expect(calcRpm(e50.finaldriveratio, external, 30, circumference)).toBe(6662)
  })

  it.each([
    ['Puch', 'E50', undefined],
    ['Puch', 'ZA50', '1 HP'],
    ['Vespa', 'Piaggio', '7:1 Rear Hub'],
    ['Tomos', 'A3', undefined],
    ['Peugeot', '103', 'SPX'],
  ])('matches the legacy formula at every speed for %s %s %s', (man, model, version) => {
    const engine = findEngine(man, model, version)!
    const ext = engine.defaultfront / engine.defaultrear
    const circ = tireCircumference(engine.defaultwheel, engine.defaulttire)
    const legacyCirc = legacy.tireCirc(engine.defaultwheel, engine.defaulttire)
    for (let mph = 1; mph <= 100; mph++) {
      expect(calcRpm(engine.finaldriveratio, ext, mph, circ)).toBe(
        legacy.rpm(engine.finaldriveratio, ext, mph, legacyCirc),
      )
    }
  })

  it('rises with a smaller front sprocket', () => {
    const shorter = 14 / e50.defaultrear
    expect(calcRpm(e50.finaldriveratio, shorter, 30, circumference)).toBeGreaterThan(
      calcRpm(e50.finaldriveratio, external, 30, circumference),
    )
  })
})

describe('calcMph', () => {
  it('inverts calcRpm', () => {
    for (const mph of [10, 25, 30, 45]) {
      const rpm = calcRpm(e50.finaldriveratio, external, mph, circumference)
      expect(calcMph(e50.finaldriveratio, external, rpm, circumference)).toBe(mph)
    }
  })
})
