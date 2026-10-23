import { describe, expect, it } from 'vitest'
import { MAX_BIKES, addBike, loadBikes, storeBikes, type SavedBike } from './savedBikes'

const bike = (n: number): SavedBike => ({ id: `id${n}`, name: `Bike ${n}`, params: `make=Puch&model=E50&front=${n}` })

describe('saved bikes', () => {
  it('starts empty', () => {
    expect(loadBikes()).toEqual([])
  })

  it('stores and loads bikes', () => {
    storeBikes([bike(1), bike(2)])
    expect(loadBikes()).toEqual([bike(1), bike(2)])
  })

  it('adds newest first', () => {
    const list = addBike([bike(1)], 'New', 'make=Tomos&model=A3')
    expect(list.map((b) => b.name)).toEqual(['New', 'Bike 1'])
  })

  it('renames instead of duplicating the same setup', () => {
    const list = addBike([bike(1), bike(2)], 'Renamed', bike(2).params)
    expect(list).toHaveLength(2)
    expect(list[0]).toEqual({ ...bike(2), name: 'Renamed' })
  })

  it('falls back to a default name', () => {
    expect(addBike([], '   ', 'make=Puch')[0].name).toBe('My bike')
  })

  it(`keeps at most ${MAX_BIKES}`, () => {
    let list: SavedBike[] = []
    for (let i = 0; i < MAX_BIKES + 5; i++) list = addBike(list, `B${i}`, `make=Puch&front=${i}`)
    expect(list).toHaveLength(MAX_BIKES)
    expect(list[0].name).toBe(`B${MAX_BIKES + 4}`)
  })

  it('ignores corrupt or tampered storage', () => {
    localStorage.setItem('toolbox.bikes', '{not json')
    expect(loadBikes()).toEqual([])
    localStorage.setItem('toolbox.bikes', JSON.stringify([bike(1), { id: 2 }, 'x', null]))
    expect(loadBikes()).toEqual([bike(1)])
  })
})
