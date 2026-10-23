import { describe, expect, it } from 'vitest'
import { round, speedFromMph, speedToMph, volumeFromLitres, volumeToLitres } from './units'

describe('round', () => {
  it('rounds to the given number of places', () => {
    expect(round(3.78541, 2)).toBe(3.79)
    expect(round(2.5)).toBe(3)
    expect(round(48.28)).toBe(48)
  })
})

describe('speed', () => {
  it('leaves imperial speeds as mph', () => {
    expect(speedFromMph(30, 'imperial')).toBe(30)
    expect(speedToMph(30, 'imperial')).toBe(30)
  })

  it('converts mph to km/h', () => {
    expect(speedFromMph(30, 'metric')).toBeCloseTo(48.28, 2)
    expect(speedToMph(100, 'metric')).toBeCloseTo(62.14, 2)
  })

  it('round-trips every km/h slider position without drift', () => {
    for (let kmh = 1; kmh <= 160; kmh++) {
      expect(Math.round(speedFromMph(speedToMph(kmh, 'metric'), 'metric'))).toBe(kmh)
    }
  })
})

describe('volume', () => {
  it('treats metric volumes as litres', () => {
    expect(volumeToLitres(5, 'metric')).toBe(5)
    expect(volumeFromLitres(5, 'metric')).toBe(5)
  })

  it('converts US gallons to litres and back', () => {
    expect(volumeToLitres(1, 'imperial')).toBeCloseTo(3.78541)
    expect(volumeFromLitres(volumeToLitres(2.5, 'imperial'), 'imperial')).toBeCloseTo(2.5)
  })
})
