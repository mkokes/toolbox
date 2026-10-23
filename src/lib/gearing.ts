const INCHES_PER_MILE = 63360

export const tireCircumference = (wheel: number, tireWidth: number) => (tireWidth * 2 + wheel) * 3.14159

/** Engine RPM at a given speed. `internalRatio` is the engine's final drive ratio; `externalRatio` is front / rear. */
export const calcRpm = (internalRatio: number, externalRatio: number, mph: number, circumference: number) =>
  Math.round(((mph / 60) * INCHES_PER_MILE) / circumference / externalRatio / internalRatio)

export const calcMph = (internalRatio: number, externalRatio: number, rpm: number, circumference: number) =>
  Math.round(((rpm * internalRatio * externalRatio * circumference) / INCHES_PER_MILE) * 60)

/** Crankshaft-to-wheel ratio, e.g. 14.2 for 14.20:1 */
export const finalRatio = (internalRatio: number, externalRatio: number) =>
  (1 / internalRatio) * (1 / externalRatio)
