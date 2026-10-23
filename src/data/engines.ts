import data from './engines.json'

export interface Engine {
  manufacturer: string
  model: string
  version?: string
  type: string
  finaldriveratio: number
  ratio1?: number
  defaultfront: number
  defaultrear: number
  defaultwheel: number
  defaulttire: number
  pistondiamter: number
  strokelength: number
  crodlength?: number
}

export const engines = data as Engine[]

const unique = <T>(list: T[]) => Array.from(new Set(list))

export const manufacturers = (): string[] => unique(engines.map((e) => e.manufacturer)).toSorted()

export const models = (manufacturer: string): string[] =>
  unique(engines.filter((e) => e.manufacturer === manufacturer).map((e) => e.model))

/** Versions for a model. Empty when the model has a single record. */
export const versions = (manufacturer: string, model: string): string[] => {
  const matches = engines.filter((e) => e.manufacturer === manufacturer && e.model === model)
  return matches.length > 1 ? matches.map((e) => e.version ?? '') : []
}

/** Resolve a single engine record. `version` is only needed when the model has several. */
export function findEngine(manufacturer?: string, model?: string, version?: string): Engine | undefined {
  if (!manufacturer || !model) return undefined
  const matches = engines.filter((e) => e.manufacturer === manufacturer && e.model === model)
  if (matches.length === 1) return matches[0]
  return version !== undefined ? matches.find((e) => e.version === version) : undefined
}
