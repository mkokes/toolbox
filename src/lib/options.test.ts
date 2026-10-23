import { describe, expect, it } from 'vitest'
import { engines } from '../data/engines'
import { mixRatios, sprocketOptions, tireWidths, wheelSizes } from './options'

const values = (opts: { value: number }[]) => opts.map((o) => o.value)

describe('wheelSizes', () => {
  it('offers 10–19 inch rims', () => {
    expect(values(wheelSizes('imperial'))).toEqual([10, 11, 12, 13, 14, 15, 16, 17, 18, 19])
  })

  it('labels in inches, adding millimetres for metric', () => {
    expect(wheelSizes('imperial').find((o) => o.value === 17)?.label).toBe('17 Inch')
    expect(wheelSizes('metric').find((o) => o.value === 17)?.label).toBe('17 in (432 mm)')
  })
})

describe('tireWidths', () => {
  it('offers 2.00–4.00 inch in quarter-inch steps, whatever the units', () => {
    const expected = [2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75, 4]
    expect(values(tireWidths('imperial'))).toEqual(expected)
    expect(values(tireWidths('metric'))).toEqual(expected)
  })

  it('labels in inches or millimetres', () => {
    expect(tireWidths('imperial').find((o) => o.value === 2.25)?.label).toBe('2.25 Inch')
    expect(tireWidths('metric').find((o) => o.value === 2.25)?.label).toBe('57 mm')
  })
})

describe('mixRatios', () => {
  it('offers 20:1 to 100:1 in steps of 10', () => {
    expect(values(mixRatios)).toEqual([20, 30, 40, 50, 60, 70, 80, 90, 100])
  })
})

describe('sprocketOptions', () => {
  it('offers chain sprockets for most bikes', () => {
    const { front, rear } = sprocketOptions('Puch')
    expect(front[0]).toEqual({ value: 9, label: '9 Tooth' })
    expect(front.at(-1)?.value).toBe(31)
    expect(rear[0].value).toBe(20)
    expect(rear.at(-1)?.value).toBe(78)
  })

  it('offers belt pulleys for Vespa', () => {
    const { front, rear } = sprocketOptions('Vespa')
    expect(front).toEqual([
      { value: 50, label: '50mm Pulley' },
      { value: 60, label: '60mm Pulley' },
    ])
    expect(values(rear)).toEqual([55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105])
  })
})

describe('engine presets', () => {
  it.each(engines.map((e) => [`${e.manufacturer} ${e.model} ${e.version ?? ''}`.trim(), e] as const))(
    '%s defaults all exist in the dropdowns',
    (_, engine) => {
      const { front, rear } = sprocketOptions(engine.manufacturer)
      expect(values(front)).toContain(engine.defaultfront)
      expect(values(rear)).toContain(engine.defaultrear)
      expect(values(wheelSizes('imperial'))).toContain(engine.defaultwheel)
      expect(values(tireWidths('imperial'))).toContain(engine.defaulttire)
    },
  )
})
