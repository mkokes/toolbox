import { useState } from 'react'
import { addBike, loadBikes, storeBikes, type SavedBike } from '../lib/savedBikes'

/** Saved bikes, persisted to localStorage. */
export function useSavedBikes() {
  const [bikes, setBikes] = useState<SavedBike[]>(loadBikes)
  const update = (next: SavedBike[]) => {
    setBikes(next)
    storeBikes(next)
  }
  return {
    bikes,
    save: (name: string, params: string) => update(addBike(bikes, name, params)),
    remove: (id: string) => update(bikes.filter((b) => b.id !== id)),
  }
}
