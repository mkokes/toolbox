/** A gearing setup the user saved, stored as its URL search string. */
export interface SavedBike {
  id: string
  name: string
  params: string
}

const STORAGE_KEY = 'toolbox.bikes'
export const MAX_BIKES = 20

const isBike = (b: unknown): b is SavedBike =>
  typeof b === 'object' &&
  b !== null &&
  typeof (b as SavedBike).id === 'string' &&
  typeof (b as SavedBike).name === 'string' &&
  typeof (b as SavedBike).params === 'string'

export function loadBikes(): SavedBike[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter(isBike).slice(0, MAX_BIKES) : []
  } catch {
    return []
  }
}

export function storeBikes(bikes: SavedBike[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bikes))
  } catch {
    // Storage unavailable (private mode); the list still works for this visit.
  }
}

const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

/** Add a bike (newest first). Saving the same setup again renames it instead of duplicating it. */
export function addBike(bikes: SavedBike[], name: string, params: string): SavedBike[] {
  const existing = bikes.find((b) => b.params === params)
  const bike = { id: existing?.id ?? newId(), name: name.trim() || 'My bike', params }
  return [bike, ...bikes.filter((b) => b.params !== params)].slice(0, MAX_BIKES)
}
