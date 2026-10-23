const ML_PER_GALLON = 3785.41

/** Millilitres of oil to add to `gallons` of gas at a `ratio`:1 mix. */
export const oilMl = (gallons: number, ratio: number) => Math.round((gallons * ML_PER_GALLON) / ratio)
