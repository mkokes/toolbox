import { MM_PER_INCH, type UnitSystem } from './units'

export interface Option<T = number> {
  value: T
  label: string
}

const range = (from: number, to: number, step = 1) =>
  Array.from({ length: Math.floor((to - from) / step) + 1 }, (_, i) => from + i * step)

// Option values are always inches (matching engines.json); only the labels change with the unit system.
// Rims are sized in inches everywhere, so metric labels keep the inch size and add millimetres.
export const wheelSizes = (units: UnitSystem): Option[] =>
  range(10, 19).map((n) => ({
    value: n,
    label: units === 'metric' ? `${n} in (${Math.round(n * MM_PER_INCH)} mm)` : `${n} Inch`,
  }))

export const tireWidths = (units: UnitSystem): Option[] =>
  range(8, 16).map((n) => {
    const w = n * 0.25
    return { value: w, label: units === 'metric' ? `${Math.round(w * MM_PER_INCH)} mm` : `${w.toFixed(2)} Inch` }
  })

export const mixRatios: Option[] = range(20, 100, 10).map((n) => ({ value: n, label: `${n} : 1` }))

/** Vespas use belt pulleys instead of chain sprockets. */
export function sprocketOptions(manufacturer: string): { front: Option[]; rear: Option[] } {
  if (manufacturer === 'Vespa') {
    return {
      front: [50, 60].map((n) => ({ value: n, label: `${n}mm Pulley` })),
      rear: range(55, 105, 5).map((n) => ({ value: n, label: `${n}mm Pulley` })),
    }
  }
  return {
    front: range(9, 31).map((n) => ({ value: n, label: `${n} Tooth` })),
    rear: range(20, 78).map((n) => ({ value: n, label: `${n} Tooth` })),
  }
}
