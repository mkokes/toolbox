import { act, renderHook, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { setSystemDark } from '../test/matchMedia'
import { renderRoute } from '../test/render'
import { brand, pageBackground } from '../theme/tokens'
import { ThemeProvider, useBrandToken, useTheme } from './ThemeContext'

const wrapper = ({ children }: { children: ReactNode }) => <ThemeProvider>{children}</ThemeProvider>
const useBoth = () => ({ ...useTheme(), brand: useBrandToken() })

describe('useTheme', () => {
  it('defaults to following the system', () => {
    const { result } = renderHook(useBoth, { wrapper })
    expect(result.current.preference).toBe('system')
    expect(result.current.resolved).toBe('light')
  })

  it('starts dark when the system prefers dark', () => {
    setSystemDark(true)
    const { result } = renderHook(useBoth, { wrapper })
    expect(result.current.resolved).toBe('dark')
    expect(result.current.brand).toEqual(brand.dark)
  })

  it('follows the system live while on Auto', () => {
    const { result } = renderHook(useBoth, { wrapper })
    act(() => setSystemDark(true))
    expect(result.current.resolved).toBe('dark')
    act(() => setSystemDark(false))
    expect(result.current.resolved).toBe('light')
  })

  it('lets a manual choice override the system and remembers it', () => {
    setSystemDark(true)
    const { result } = renderHook(useBoth, { wrapper })
    act(() => result.current.setPreference('light'))
    expect(result.current.resolved).toBe('light')
    expect(localStorage.getItem('toolbox.theme')).toBe('light')
    act(() => setSystemDark(false))
    act(() => setSystemDark(true))
    expect(result.current.resolved).toBe('light')
  })

  it('restores a saved choice and ignores junk', () => {
    localStorage.setItem('toolbox.theme', 'dark')
    expect(renderHook(useBoth, { wrapper }).result.current.resolved).toBe('dark')
    localStorage.setItem('toolbox.theme', 'sepia')
    expect(renderHook(useBoth, { wrapper }).result.current.preference).toBe('system')
  })

  it('marks <html> with the active theme and its background', () => {
    const { result } = renderHook(useBoth, { wrapper })
    act(() => result.current.setPreference('dark'))
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(document.documentElement.style.backgroundColor).toBe(hexToRgb(pageBackground('dark')))
  })
})

describe('ThemeToggle', () => {
  it('switches between light, auto and dark from the header', async () => {
    const { user } = renderRoute('/')
    expect(screen.getByRole('radio', { name: 'Match system theme' })).toBeChecked()

    await user.click(screen.getByRole('radio', { name: 'Dark theme' }))
    expect(document.documentElement.dataset.theme).toBe('dark')

    await user.click(screen.getByRole('radio', { name: 'Light theme' }))
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(localStorage.getItem('toolbox.theme')).toBe('light')
  })
})

function hexToRgb(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
  return `rgb(${r}, ${g}, ${b})`
}
