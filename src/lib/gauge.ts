// Geometry for the tachometer dial. Angles are in degrees, clockwise from 3 o'clock (SVG screen coordinates).

/** The dial starts at 7:30 (bottom-left)… */
export const GAUGE_START = 135
/** …and sweeps 270° clockwise to 4:30 (bottom-right). */
export const GAUGE_SWEEP = 270

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

/** Needle angle for an RPM on a dial reading 0…max. Out-of-range values pin to the ends. */
export const rpmToAngle = (rpm: number, max: number) => GAUGE_START + GAUGE_SWEEP * clamp(rpm / max, 0, 1)

export const polar = (cx: number, cy: number, r: number, deg: number) => {
  const rad = (deg * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

/** SVG path for a clockwise arc between two angles. */
export function arcPath(cx: number, cy: number, r: number, fromDeg: number, toDeg: number) {
  const a = polar(cx, cy, r, fromDeg)
  const b = polar(cx, cy, r, toDeg)
  const largeArc = toDeg - fromDeg > 180 ? 1 : 0
  return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`
}
