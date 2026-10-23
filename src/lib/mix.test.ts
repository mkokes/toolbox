import { describe, expect, it } from 'vitest'
import { mlToFlOz, oilMl } from './mix'
import { volumeToLitres } from './units'

describe('oilMl', () => {
  it('needs 76 ml for a US gallon at 50:1', () => {
    expect(oilMl(volumeToLitres(1, 'imperial'), 50)).toBe(76)
  })

  it('needs 100 ml for 5 litres at 50:1', () => {
    expect(oilMl(5, 50)).toBe(100)
  })

  it('needs 25 ml for 1 litre at 40:1', () => {
    expect(oilMl(1, 40)).toBe(25)
  })

  it('matches the legacy gallon formula, (gallons * 3785.41 / ratio).toFixed(0)', () => {
    for (let tenths = 1; tenths <= 100; tenths++) {
      const gallons = tenths / 10
      for (let ratio = 20; ratio <= 100; ratio += 10) {
        expect(String(oilMl(volumeToLitres(gallons, 'imperial'), ratio))).toBe(((gallons * 3785.41) / ratio).toFixed(0))
      }
    }
  })
})

describe('mlToFlOz', () => {
  it('converts millilitres to US fluid ounces', () => {
    expect(mlToFlOz(29.5735)).toBeCloseTo(1)
    expect(mlToFlOz(76)).toBeCloseTo(2.57, 2)
  })
})
