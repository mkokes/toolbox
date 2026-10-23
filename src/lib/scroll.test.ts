import { describe, expect, it } from 'vitest'
import { hasMoreBelow } from './scroll'

describe('hasMoreBelow', () => {
  it('is false when the page fits on screen', () => {
    expect(hasMoreBelow({ scrollTop: 0, clientHeight: 700, scrollHeight: 700 })).toBe(false)
  })

  it('is true at the top of a longer page', () => {
    expect(hasMoreBelow({ scrollTop: 0, clientHeight: 700, scrollHeight: 1200 })).toBe(true)
  })

  it('is true partway down', () => {
    expect(hasMoreBelow({ scrollTop: 300, clientHeight: 700, scrollHeight: 1200 })).toBe(true)
  })

  it('is false at the bottom', () => {
    expect(hasMoreBelow({ scrollTop: 500, clientHeight: 700, scrollHeight: 1200 })).toBe(false)
  })

  it('ignores a few pixels of rounding or overscroll', () => {
    expect(hasMoreBelow({ scrollTop: 495, clientHeight: 700, scrollHeight: 1200 })).toBe(false)
    expect(hasMoreBelow({ scrollTop: 480, clientHeight: 700, scrollHeight: 1200 })).toBe(true)
  })
})
