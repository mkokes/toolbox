import { describe, expect, it } from 'vitest'
import { findEngine } from '../data/engines'
import {
  CUSTOM,
  describeDrivetrain,
  engineRatio,
  isComplete,
  isStock,
  parseSetup,
  setupName,
  stockDrivetrain,
  toSearchParams,
  type GearingSetup,
} from './setup'

const parse = (q: string) => parseSetup(new URLSearchParams(q))

const E50: GearingSetup = { make: 'Puch', model: 'E50', front: 16, rear: 45, wheel: 17, tire: 2.25 }

describe('parseSetup', () => {
  it('reads a complete preset setup', () => {
    expect(parse('make=Puch&model=E50&front=16&rear=45&wheel=17&tire=2.25')).toEqual(E50)
  })

  it('needs a version only when the model has several', () => {
    expect(parse('make=Puch&model=ZA50&front=18').version).toBeUndefined()
    expect(parse('make=Puch&model=ZA50&version=1.5%20-%202%20HP').version).toBe('1.5 - 2 HP')
  })

  it.each([
    ['an unknown make', 'make=Honda&model=E50', {}],
    ['an unknown model', 'make=Puch&model=Nope&front=16', { make: 'Puch' }],
    ['an unknown version', 'make=Puch&model=ZA50&version=9%20HP', { make: 'Puch', model: 'ZA50' }],
  ])('stops at %s', (_, q, expected) => {
    expect(parse(q)).toEqual(expected)
  })

  it('drops drivetrain values that are not in the dropdowns', () => {
    const s = parse('make=Puch&model=E50&front=99&rear=45&wheel=17.5&tire=abc')
    expect(s).toMatchObject({ rear: 45 })
    expect(s.front).toBeUndefined()
    expect(s.wheel).toBeUndefined()
    expect(s.tire).toBeUndefined()
  })

  it('only accepts pulley sizes for Vespa', () => {
    expect(parse('make=Vespa&model=Piaggio&version=7%3A1%20Rear%20Hub&front=50').front).toBe(50)
    expect(parse('make=Puch&model=E50&front=50').front).toBeUndefined()
  })

  it('reads a custom engine reduction within range', () => {
    expect(parse('make=custom&reduction=5.05').reduction).toBe(5.05)
    expect(parse('make=custom&reduction=0.5').reduction).toBeUndefined()
    expect(parse('make=custom&reduction=abc').reduction).toBeUndefined()
  })
})

describe('toSearchParams', () => {
  it('round-trips through parseSetup', () => {
    for (const s of [
      E50,
      { make: 'Puch', model: 'ZA50', version: '1 HP', front: 16, rear: 45, wheel: 17, tire: 2.25 },
      { make: CUSTOM, reduction: 5.05, front: 14, rear: 50, wheel: 16, tire: 2.5 },
    ]) {
      expect(parseSetup(toSearchParams(s))).toEqual(s)
    }
  })

  it('appends page state', () => {
    expect(toSearchParams(E50, { view: 'results' }).get('view')).toBe('results')
  })
})

describe('engineRatio', () => {
  it('uses the preset ratio, or 1 / reduction for a custom engine', () => {
    expect(engineRatio(E50)).toBe(findEngine('Puch', 'E50')!.finaldriveratio)
    expect(engineRatio({ make: CUSTOM, reduction: 4 })).toBe(0.25)
    expect(engineRatio({ make: CUSTOM })).toBeUndefined()
  })
})

describe('completeness and stock', () => {
  it('needs an engine and a full drivetrain', () => {
    expect(isComplete(E50)).toBe(true)
    expect(isComplete({ ...E50, tire: undefined })).toBe(false)
    expect(isComplete({ make: CUSTOM, ...stockDrivetrain({ make: CUSTOM }) })).toBe(false)
  })

  it('knows when the drivetrain matches the engine defaults', () => {
    expect(isStock(E50)).toBe(true)
    expect(isStock({ ...E50, rear: 48 })).toBe(false)
  })
})

describe('describeDrivetrain / setupName', () => {
  it('summarises the drivetrain in either unit system', () => {
    expect(describeDrivetrain(E50, 'imperial')).toBe('16T / 45T · 17″ rim · 2.25″ tire')
    expect(describeDrivetrain(E50, 'metric')).toBe('16T / 45T · 17 in (432 mm) rim · 57 mm tire')
  })

  it('names a setup for saving', () => {
    expect(setupName(E50)).toBe('Puch E50 16/45')
    expect(setupName({ make: CUSTOM, reduction: 5.05, front: 14, rear: 50 })).toBe('Custom 5.05:1 14/50')
  })
})
