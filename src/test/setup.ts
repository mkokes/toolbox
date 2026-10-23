import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
import { installMatchMedia, resetMatchMedia } from './matchMedia'

afterEach(() => {
  cleanup()
  localStorage.clear()
  resetMatchMedia()
  delete document.documentElement.dataset.theme
})

// jsdom gaps that antd relies on.
installMatchMedia()

// antd measures scrollbars with getComputedStyle(el, '::-webkit-scrollbar'); jsdom doesn't support pseudo-elements.
const { getComputedStyle } = window
window.getComputedStyle = (elt: Element) => getComputedStyle(elt)
