// Compare the current drivetrain with an alternative ("what if I go up two teeth at the rear?").
import { calcRpm, finalRatio, speedAtRpm, tireCircumference } from './gearing'
import type { Drivetrain } from './setup'

export interface Comparison {
  /** Crank-to-wheel ratio (e.g. 14.2 for 14.20:1) */
  ratio: { base: number; alt: number }
  /** Engine RPM at the given road speed */
  rpm: { base: number; alt: number }
  /** Road speed in mph at the target RPM, unrounded */
  topSpeedMph: { base: number; alt: number }
}

/** Ratio, RPM at `mph`, and speed at `targetRpm` for both drivetrains on the same engine. */
export function compareGearing(
  internalRatio: number,
  base: Drivetrain,
  alt: Drivetrain,
  { mph, targetRpm }: { mph: number; targetRpm: number },
): Comparison {
  const figures = (d: Drivetrain) => {
    const external = d.front / d.rear
    const circumference = tireCircumference(d.wheel, d.tire)
    return {
      ratio: finalRatio(internalRatio, external),
      rpm: calcRpm(internalRatio, external, mph, circumference),
      topSpeedMph: speedAtRpm(internalRatio, external, targetRpm, circumference),
    }
  }
  const b = figures(base)
  const a = figures(alt)
  return {
    ratio: { base: b.ratio, alt: a.ratio },
    rpm: { base: b.rpm, alt: a.rpm },
    topSpeedMph: { base: b.topSpeedMph, alt: a.topSpeedMph },
  }
}

/** Move `value` by `steps` positions within the allowed `values` (sorted ascending), stopping at the ends. */
export function shiftOption(values: number[], value: number, steps: number) {
  const i = values.indexOf(value)
  if (i === -1) return value
  return values[Math.min(values.length - 1, Math.max(0, i + steps))]
}
