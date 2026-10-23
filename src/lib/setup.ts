// A gearing setup (engine + drivetrain) and its URL form, so setups can be shared, bookmarked and saved.
import { findEngine, manufacturers, models, versions, type Engine } from '../data/engines'
import { sprocketOptions, tireWidths, wheelSizes } from './options'
import type { UnitSystem } from './units'

/** Manufacturer value for an engine that isn't in engines.json. */
export const CUSTOM = 'custom'

/** Engine reduction limits for a custom engine, as X : 1 (crank to output sprocket). */
export const REDUCTION_MIN = 1.5
export const REDUCTION_MAX = 30

export interface Drivetrain {
  front: number
  rear: number
  wheel: number
  tire: number
}

export interface GearingSetup extends Partial<Drivetrain> {
  make?: string
  model?: string
  version?: string
  /** Custom engines only: crank-to-sprocket reduction, X : 1 */
  reduction?: number
}

/** Drivetrain defaults for a custom engine (a stock Puch E50's). */
const CUSTOM_DRIVETRAIN: Drivetrain = { front: 16, rear: 45, wheel: 17, tire: 2.25 }

const numberIn = (raw: string | null, allowed: number[]) => {
  if (raw === null) return undefined
  const n = Number(raw)
  return allowed.includes(n) ? n : undefined
}

const values = (opts: { value: number }[]) => opts.map((o) => o.value)

/**
 * Read a setup from URL search params. Anything unknown or out of range is dropped (never thrown), so a
 * mangled or outdated link degrades to a partially-filled form rather than an error.
 */
export function parseSetup(params: URLSearchParams): GearingSetup {
  const make = params.get('make') ?? undefined
  if (!make || (make !== CUSTOM && !manufacturers().includes(make))) return {}
  const setup: GearingSetup = { make }

  if (make === CUSTOM) {
    const r = Number(params.get('reduction'))
    if (params.get('reduction') !== null && r >= REDUCTION_MIN && r <= REDUCTION_MAX) setup.reduction = r
  } else {
    const model = params.get('model') ?? undefined
    if (!model || !models(make).includes(model)) return setup
    setup.model = model
    const choices = versions(make, model)
    if (choices.length > 0) {
      const version = params.get('version') ?? undefined
      if (!version || !choices.includes(version)) return setup
      setup.version = version
    }
  }

  const sprockets = sprocketOptions(make)
  const front = numberIn(params.get('front'), values(sprockets.front))
  const rear = numberIn(params.get('rear'), values(sprockets.rear))
  const wheel = numberIn(params.get('wheel'), values(wheelSizes('imperial')))
  const tire = numberIn(params.get('tire'), values(tireWidths('imperial')))
  return { ...setup, front, rear, wheel, tire }
}

/** URL search params for a setup, plus optional page state (e.g. `view=results`). */
export function toSearchParams(setup: GearingSetup, extra: Record<string, string> = {}) {
  const p = new URLSearchParams()
  const keys = ['make', 'model', 'version', 'reduction', 'front', 'rear', 'wheel', 'tire'] as const
  for (const k of keys) if (setup[k] !== undefined) p.set(k, String(setup[k]))
  for (const [k, v] of Object.entries(extra)) p.set(k, v)
  return p
}

/** The preset engine for a setup, if it names one completely. */
export const engineFor = (s: GearingSetup): Engine | undefined =>
  s.make && s.make !== CUSTOM ? findEngine(s.make, s.model, s.version) : undefined

/** The engine's internal ratio (the `finaldriveratio` of engines.json), for preset or custom engines. */
export function engineRatio(s: GearingSetup): number | undefined {
  if (s.make === CUSTOM) return s.reduction ? 1 / s.reduction : undefined
  return engineFor(s)?.finaldriveratio
}

/** Stock drivetrain for the setup's engine (custom engines get sensible defaults). */
export function stockDrivetrain(s: GearingSetup): Drivetrain | undefined {
  if (s.make === CUSTOM) return CUSTOM_DRIVETRAIN
  const e = engineFor(s)
  return e && { front: e.defaultfront, rear: e.defaultrear, wheel: e.defaultwheel, tire: e.defaulttire }
}

/** A setup with its engine's stock drivetrain filled in (used when an engine is picked). */
export const withStockDrivetrain = (s: GearingSetup): GearingSetup => ({ ...s, ...stockDrivetrain(s) })

export const drivetrainOf = (s: GearingSetup): Drivetrain | undefined =>
  s.front !== undefined && s.rear !== undefined && s.wheel !== undefined && s.tire !== undefined
    ? { front: s.front, rear: s.rear, wheel: s.wheel, tire: s.tire }
    : undefined

/** True once there's enough to calculate: an engine ratio and a full drivetrain. */
export const isComplete = (s: GearingSetup) => engineRatio(s) !== undefined && drivetrainOf(s) !== undefined

export function isStock(s: GearingSetup) {
  const stock = stockDrivetrain(s)
  const d = drivetrainOf(s)
  return !!stock && !!d && (Object.keys(stock) as (keyof Drivetrain)[]).every((k) => stock[k] === d[k])
}

/** One-line drivetrain summary, e.g. "16T / 45T · 17″ rim · 2.25″ tire". */
export function describeDrivetrain(s: GearingSetup, units: UnitSystem) {
  const d = drivetrainOf(s)
  if (!d) return ''
  const gearing = s.make === 'Vespa' ? `${d.front} / ${d.rear} mm pulleys` : `${d.front}T / ${d.rear}T`
  const wheel =
    wheelSizes(units)
      .find((o) => o.value === d.wheel)
      ?.label.replace(' Inch', '″') ?? ''
  const tire =
    tireWidths(units)
      .find((o) => o.value === d.tire)
      ?.label.replace(' Inch', '″') ?? ''
  return `${gearing} · ${wheel} rim · ${tire} tire`
}

/** Default name when saving, e.g. "Puch E50 16/45" or "Custom 5.05:1 16/45". */
export function setupName(s: GearingSetup) {
  const engine = s.make === CUSTOM ? `Custom ${s.reduction}:1` : [s.make, s.model, s.version].filter(Boolean).join(' ')
  return s.front !== undefined && s.rear !== undefined ? `${engine} ${s.front}/${s.rear}` : engine
}
