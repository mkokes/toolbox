// A controllable window.matchMedia for jsdom. Tests can flip the simulated OS dark-mode preference
// with setSystemDark(); listeners registered through addEventListener('change') are notified.

type Listener = (e: { matches: boolean; media: string }) => void

let systemDark = false
const listeners = new Set<{ query: string; fn: Listener }>()

const matchesQuery = (query: string) => (query.includes('prefers-color-scheme: dark') ? systemDark : false)

export function installMatchMedia() {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      get matches() {
        return matchesQuery(query)
      },
      media: query,
      onchange: null,
      addListener: (fn: Listener) => listeners.add({ query, fn }),
      removeListener: (fn: Listener) => {
        for (const l of listeners) if (l.fn === fn) listeners.delete(l)
      },
      addEventListener: (_: string, fn: Listener) => listeners.add({ query, fn }),
      removeEventListener: (_: string, fn: Listener) => {
        for (const l of listeners) if (l.fn === fn) listeners.delete(l)
      },
      dispatchEvent: () => false,
    }),
  })
}

/** Simulate the OS switching to (or from) dark mode. */
export function setSystemDark(dark: boolean) {
  systemDark = dark
  for (const { query, fn } of listeners) fn({ matches: matchesQuery(query), media: query })
}

export function resetMatchMedia() {
  systemDark = false
  listeners.clear()
}
