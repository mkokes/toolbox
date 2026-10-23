// Volumetric efficiency bounds; a two-stroke's VE varies widely across the pipe's powerband.
export const MIN_VE = 0.55
export const MAX_VE = 1.25

/** Suggested carburetor bore in mm. */
export function calcCarbBore(rpm: number, diameter: number, stroke: number, ve: number): number {
  const radius = diameter / 2
  const volume = 3.1415 * radius ** 2 * stroke
  return Number(((ve * Math.sqrt(volume * rpm)) / 1000).toFixed(2))
}
