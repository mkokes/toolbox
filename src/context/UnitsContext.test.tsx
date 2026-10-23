import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { UnitsProvider, useUnits } from './UnitsContext'

const wrapper = ({ children }: { children: ReactNode }) => <UnitsProvider>{children}</UnitsProvider>
const swallowError = (e: ErrorEvent) => e.preventDefault()

describe('useUnits', () => {
  it('defaults to imperial', () => {
    const { result } = renderHook(() => useUnits(), { wrapper })
    expect(result.current.units).toBe('imperial')
  })

  it('remembers the choice in localStorage', () => {
    const { result } = renderHook(() => useUnits(), { wrapper })
    act(() => result.current.setUnits('metric'))
    expect(result.current.units).toBe('metric')
    expect(localStorage.getItem('toolbox.units')).toBe('metric')
  })

  it('restores a saved choice', () => {
    localStorage.setItem('toolbox.units', 'metric')
    const { result } = renderHook(() => useUnits(), { wrapper })
    expect(result.current.units).toBe('metric')
  })

  it('ignores an unrecognised saved value', () => {
    localStorage.setItem('toolbox.units', 'furlongs')
    const { result } = renderHook(() => useUnits(), { wrapper })
    expect(result.current.units).toBe('imperial')
  })

  it('throws when used outside the provider', () => {
    // React and jsdom both report the thrown render error; keep the test output clean.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    window.addEventListener('error', swallowError)
    expect(() => renderHook(() => useUnits())).toThrow(/UnitsProvider/)
    window.removeEventListener('error', swallowError)
    spy.mockRestore()
  })
})
