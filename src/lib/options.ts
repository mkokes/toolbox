export interface Option<T = number> {
  value: T
  label: string
}

const range = (from: number, to: number, step = 1) =>
  Array.from({ length: Math.floor((to - from) / step) + 1 }, (_, i) => from + i * step)

export const wheelSizes: Option[] = range(10, 19).map((n) => ({ value: n, label: `${n} Inch` }))

export const tireWidths: Option[] = range(8, 16).map((n) => {
  const w = n * 0.25
  return { value: w, label: `${w.toFixed(2)} Inch` }
})

export const mixRatios: Option[] = range(20, 100, 10).map((n) => ({ value: n, label: `${n} : 1` }))

export const pistonDiameters: Option[] = range(38, 51).map((n) => ({ value: n, label: `${n}mm` }))

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
