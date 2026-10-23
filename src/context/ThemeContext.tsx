import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { ConfigProvider } from 'antd'
import { getAntdTheme } from '../theme/antdTheme'
import { brand, pageBackground, type BrandToken, type ThemeMode } from '../theme/tokens'

export type ThemePreference = ThemeMode | 'system'

const STORAGE_KEY = 'toolbox.theme'
const DARK_QUERY = '(prefers-color-scheme: dark)'

const readStored = (): ThemePreference => {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v === 'light' || v === 'dark' || v === 'system' ? v : 'system'
  } catch {
    return 'system'
  }
}

const systemMode = (): ThemeMode => (window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light')

interface ThemeValue {
  /** What the user picked */
  preference: ThemePreference
  /** The mode actually in use */
  resolved: ThemeMode
  setPreference: (p: ThemePreference) => void
}

const ThemeContext = createContext<ThemeValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(readStored)
  const [system, setSystem] = useState<ThemeMode>(systemMode)

  // Follow the OS setting live while on "Auto".
  useEffect(() => {
    const mq = window.matchMedia(DARK_QUERY)
    const onChange = () => setSystem(mq.matches ? 'dark' : 'light')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const resolved = preference === 'system' ? system : preference

  // Keep <html> and the browser chrome in step with the theme (index.html sets the initial values pre-React).
  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = resolved
    root.style.backgroundColor = pageBackground(resolved)
    for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
      meta.content = pageBackground(resolved)
    }
  }, [resolved])

  const setPreference = (p: ThemePreference) => {
    setPreferenceState(p)
    try {
      localStorage.setItem(STORAGE_KEY, p)
    } catch {
      // Storage unavailable (private mode); the choice still applies for this visit.
    }
  }

  return <ThemeContext.Provider value={{ preference, resolved, setPreference }}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}

/** Brand values antd has no token for (display font, accent green, button gradient…), for the active mode. */
export function useBrandToken(): BrandToken {
  return brand[useTheme().resolved]
}

/** antd's ConfigProvider with the theme for whichever mode is active. */
export function ThemedConfig({ children }: { children: ReactNode }) {
  const { resolved } = useTheme()
  return <ConfigProvider theme={getAntdTheme(resolved)}>{children}</ConfigProvider>
}
