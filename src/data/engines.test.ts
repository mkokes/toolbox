import { describe, expect, it } from 'vitest'
import { engines, findEngine, manufacturers, models, versions } from './engines'

describe('manufacturers', () => {
  it('lists each manufacturer once, sorted', () => {
    expect(manufacturers()).toEqual([
      'Garelli',
      'Laura',
      'Minarelli',
      'Motobecane',
      'Peugeot',
      'Puch',
      'Sachs',
      'Tomos',
      'Vespa',
    ])
  })
})

describe('models', () => {
  it('lists each model of a manufacturer once', () => {
    expect(models('Puch')).toEqual(['E50', 'ZA50'])
    expect(models('Laura')).toEqual(['M48', 'M56'])
  })
})

describe('versions', () => {
  it('is empty when a model has a single record', () => {
    expect(versions('Puch', 'E50')).toEqual([])
    // Garelli Vertical has a version string but only one record, so there is nothing to choose.
    expect(versions('Garelli', 'Vertical')).toEqual([])
  })

  it('lists the versions when a model has several records', () => {
    expect(versions('Puch', 'ZA50')).toEqual(['1 HP', '1.5 - 2 HP'])
  })
})

describe('findEngine', () => {
  it('resolves a single-record model without a version', () => {
    expect(findEngine('Puch', 'E50')?.defaultfront).toBe(16)
  })

  it('needs a version when a model has several records', () => {
    expect(findEngine('Puch', 'ZA50')).toBeUndefined()
    expect(findEngine('Puch', 'ZA50', '1.5 - 2 HP')?.defaultfront).toBe(18)
  })

  it('returns undefined until manufacturer and model are chosen', () => {
    expect(findEngine()).toBeUndefined()
    expect(findEngine('Puch')).toBeUndefined()
  })
})

describe('engines.json', () => {
  it('stores every model as a string', () => {
    for (const e of engines) expect(typeof e.model).toBe('string')
  })

  it('has no duplicate manufacturer/model/version combinations', () => {
    const keys = engines.map((e) => `${e.manufacturer}|${e.model}|${e.version ?? ''}`)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('gives every record a positive final drive ratio', () => {
    for (const e of engines) expect(e.finaldriveratio).toBeGreaterThan(0)
  })
})
