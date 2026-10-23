export type UnitSystem = 'imperial' | 'metric'

export const KM_PER_MILE = 1.609344
export const MM_PER_INCH = 25.4
// Matches the original toolbox's 3785.41 ml per US gallon so imperial results are unchanged.
export const LITRES_PER_GALLON = 3.78541
export const ML_PER_FL_OZ = 29.5735

export const round = (n: number, places = 0) => {
  const f = 10 ** places
  return Math.round(n * f) / f
}

/** Speed shown in the active unit (mph or km/h), from a canonical mph value. */
export const speedFromMph = (mph: number, units: UnitSystem) => (units === 'metric' ? mph * KM_PER_MILE : mph)
export const speedToMph = (speed: number, units: UnitSystem) => (units === 'metric' ? speed / KM_PER_MILE : speed)

/** Fuel volume in the active unit (US gallons or litres), to and from litres. */
export const volumeToLitres = (amount: number, units: UnitSystem) =>
  units === 'imperial' ? amount * LITRES_PER_GALLON : amount
export const volumeFromLitres = (litres: number, units: UnitSystem) =>
  units === 'imperial' ? litres / LITRES_PER_GALLON : litres

export const unitLabels = {
  imperial: { speed: 'MPH', speedShort: 'mph', volume: 'Gallons', length: 'in' },
  metric: { speed: 'KM/H', speedShort: 'km/h', volume: 'Litres', length: 'mm' },
} as const satisfies Record<UnitSystem, Record<string, string>>
