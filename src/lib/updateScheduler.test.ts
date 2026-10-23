import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CHECK_INTERVAL_MS, IDLE_MS, createUpdateScheduler } from './updateScheduler'

const MINUTE = 60 * 1000

const setVisibility = (state: 'visible' | 'hidden') => {
  vi.spyOn(document, 'visibilityState', 'get').mockReturnValue(state)
  document.dispatchEvent(new Event('visibilitychange'))
}

describe('createUpdateScheduler', () => {
  const checkForUpdate = vi.fn<() => void>()
  const applyUpdate = vi.fn<() => void>()
  let scheduler: ReturnType<typeof createUpdateScheduler>

  beforeEach(() => {
    vi.useFakeTimers()
    checkForUpdate.mockClear()
    applyUpdate.mockClear()
    scheduler = createUpdateScheduler({ checkForUpdate, applyUpdate })
  })
  afterEach(() => {
    scheduler.stop()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('checks for an update every hour', () => {
    vi.advanceTimersByTime(CHECK_INTERVAL_MS * 3)
    expect(checkForUpdate).toHaveBeenCalledTimes(3)
  })

  it('does not check while offline', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
    vi.advanceTimersByTime(CHECK_INTERVAL_MS)
    expect(checkForUpdate).not.toHaveBeenCalled()
  })

  it('checks when the app returns to the foreground, but not when it is hidden', () => {
    setVisibility('hidden')
    expect(checkForUpdate).not.toHaveBeenCalled()
    setVisibility('visible')
    expect(checkForUpdate).toHaveBeenCalledTimes(1)
  })

  it('applies a found update once the user has been idle for an hour', () => {
    scheduler.updateFound()
    vi.advanceTimersByTime(IDLE_MS - MINUTE)
    expect(applyUpdate).not.toHaveBeenCalled()
    vi.advanceTimersByTime(MINUTE)
    expect(applyUpdate).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(IDLE_MS)
    expect(applyUpdate).toHaveBeenCalledTimes(1)
  })

  it('waits another full hour after the user does something', () => {
    scheduler.updateFound()
    vi.advanceTimersByTime(IDLE_MS - MINUTE)
    window.dispatchEvent(new Event('pointerdown'))
    vi.advanceTimersByTime(IDLE_MS - MINUTE)
    expect(applyUpdate).not.toHaveBeenCalled()
    vi.advanceTimersByTime(MINUTE)
    expect(applyUpdate).toHaveBeenCalledTimes(1)
  })

  it('counts returning to the app as activity', () => {
    scheduler.updateFound()
    setVisibility('hidden')
    vi.advanceTimersByTime(IDLE_MS - MINUTE)
    setVisibility('visible')
    vi.advanceTimersByTime(IDLE_MS - MINUTE)
    expect(applyUpdate).not.toHaveBeenCalled()
  })

  it('applies an update that was found while the app is hidden once an hour has passed', () => {
    setVisibility('hidden')
    scheduler.updateFound()
    vi.advanceTimersByTime(IDLE_MS)
    expect(applyUpdate).toHaveBeenCalledTimes(1)
  })

  it('does nothing after stop', () => {
    scheduler.updateFound()
    scheduler.stop()
    vi.advanceTimersByTime(IDLE_MS * 2)
    expect(checkForUpdate).not.toHaveBeenCalled()
    expect(applyUpdate).not.toHaveBeenCalled()
  })
})
