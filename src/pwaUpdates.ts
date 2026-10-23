import { registerSW } from 'virtual:pwa-register'
import { createUpdateScheduler } from './lib/updateScheduler'

/**
 * Registers the service worker and keeps an open app up to date (see `createUpdateScheduler`). A new version
 * waits until the user has been idle for an hour, or until the app is next closed and reopened.
 */
export function startUpdateChecks() {
  let registration: ServiceWorkerRegistration | undefined
  const scheduler = createUpdateScheduler({
    checkForUpdate: () => void registration?.update().catch(() => {}),
    applyUpdate: () => void updateServiceWorker(true),
  })
  const updateServiceWorker = registerSW({
    immediate: true,
    onRegisteredSW: (_url, r) => {
      registration = r
    },
    onNeedRefresh: scheduler.updateFound,
  })
}
