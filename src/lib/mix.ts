import { ML_PER_FL_OZ } from './units'

/** Millilitres of oil to add to `litres` of gas at a `ratio`:1 mix. */
export const oilMl = (litres: number, ratio: number) => Math.round((litres * 1000) / ratio)

export const mlToFlOz = (ml: number) => ml / ML_PER_FL_OZ
