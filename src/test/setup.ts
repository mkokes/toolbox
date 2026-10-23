import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

// jsdom gaps that antd relies on.
const noop = () => {}
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: noop,
    removeListener: noop,
    addEventListener: noop,
    removeEventListener: noop,
    dispatchEvent: () => false,
  }),
})

// antd measures scrollbars with getComputedStyle(el, '::-webkit-scrollbar'); jsdom doesn't support pseudo-elements.
const { getComputedStyle } = window
window.getComputedStyle = (elt: Element) => getComputedStyle(elt)
