/** How often an open app asks the server whether a new version has been deployed. */
export const CHECK_INTERVAL_MS = 60 * 60 * 1000
/** How long the user must have been idle before a found update is applied (which reloads the page). */
export const IDLE_MS = 60 * 60 * 1000
/** How often a pending update looks at the idle time. */
const IDLE_POLL_MS = 60 * 1000

const ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'touchstart', 'wheel', 'scroll'] as const

interface UpdateSchedulerOptions {
  /** Ask the server for a newer version. Only called while online. */
  checkForUpdate: () => void
  /** Switch to the new version, reloading the page. */
  applyUpdate: () => void
}

/**
 * Keeps a long-open app current. It checks for a new version every hour and whenever the app comes back to the
 * foreground. Once one is found (`updateFound`), it is applied only after the user has been idle for an hour, so
 * the reload never lands on someone who is using the app. Returning to the app counts as activity, and anything
 * left pending still takes over the next time the app is closed and reopened.
 */
export function createUpdateScheduler({ checkForUpdate, applyUpdate }: UpdateSchedulerOptions) {
  let lastActivity = Date.now()
  let idlePoll: ReturnType<typeof setInterval> | undefined
  let applied = false

  const markActive = () => {
    lastActivity = Date.now()
  }
  const check = () => {
    if (navigator.onLine) checkForUpdate()
  }
  const onVisibilityChange = () => {
    if (document.visibilityState !== 'visible') return
    markActive()
    check()
  }

  for (const type of ACTIVITY_EVENTS) window.addEventListener(type, markActive, { passive: true, capture: true })
  document.addEventListener('visibilitychange', onVisibilityChange)
  const checkTimer = setInterval(check, CHECK_INTERVAL_MS)

  function stop() {
    clearInterval(checkTimer)
    clearInterval(idlePoll)
    for (const type of ACTIVITY_EVENTS) window.removeEventListener(type, markActive, { capture: true })
    document.removeEventListener('visibilitychange', onVisibilityChange)
  }

  function updateFound() {
    if (idlePoll !== undefined || applied) return
    idlePoll = setInterval(() => {
      if (Date.now() - lastActivity < IDLE_MS) return
      applied = true
      stop()
      applyUpdate()
    }, IDLE_POLL_MS)
  }

  return { updateFound, stop }
}
