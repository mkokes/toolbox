import { createContext, useContext, useState, type ReactNode } from 'react'
import type { UnitSystem } from '../lib/units'

const STORAGE_KEY = 'toolbox.units'

const readStored = (): UnitSystem => {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v === 'metric' || v === 'imperial' ? v : 'imperial'
  } catch {
    return 'imperial'
  }
}

interface UnitsValue {
  units: UnitSystem
  setUnits: (u: UnitSystem) => void
}

const UnitsContext = createContext<UnitsValue | null>(null)

export function UnitsProvider({ children }: { children: ReactNode }) {
  const [units, setUnitsState] = useState<UnitSystem>(readStored)

  const setUnits = (u: UnitSystem) => {
    setUnitsState(u)
    try {
      localStorage.setItem(STORAGE_KEY, u)
    } catch {
      // Storage unavailable (private mode); the choice still applies for this visit.
    }
  }

  return <UnitsContext.Provider value={{ units, setUnits }}>{children}</UnitsContext.Provider>
}

export function useUnits(): UnitsValue {
  const ctx = useContext(UnitsContext)
  if (!ctx) throw new Error('useUnits must be used inside <UnitsProvider>')
  return ctx
}
