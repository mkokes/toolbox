import { act, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import ScrollHint from './ScrollHint'

const root = document.documentElement

function setPage(metrics: { scrollTop: number; clientHeight: number; scrollHeight: number }) {
  for (const [key, value] of Object.entries(metrics)) Object.defineProperty(root, key, { value, configurable: true })
}

const hint = (container: HTMLElement) => container.querySelector('.tb-scroll-hint')!

describe('ScrollHint', () => {
  afterEach(() => {
    for (const key of ['scrollTop', 'clientHeight', 'scrollHeight']) Reflect.deleteProperty(root, key)
  })

  it('stays hidden when the page fits on screen', () => {
    setPage({ scrollTop: 0, clientHeight: 700, scrollHeight: 700 })
    const { container } = render(<ScrollHint />)
    expect(hint(container)).not.toHaveClass('tb-scroll-hint--visible')
  })

  it('shows while there is more below and hides at the bottom', () => {
    setPage({ scrollTop: 0, clientHeight: 700, scrollHeight: 1400 })
    const { container } = render(<ScrollHint />)
    expect(hint(container)).toHaveClass('tb-scroll-hint--visible')

    setPage({ scrollTop: 700, clientHeight: 700, scrollHeight: 1400 })
    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })
    expect(hint(container)).not.toHaveClass('tb-scroll-hint--visible')
  })

  it('sits above the action bar when there is one', () => {
    setPage({ scrollTop: 0, clientHeight: 700, scrollHeight: 1400 })
    const bar = document.body.appendChild(document.createElement('div'))
    bar.className = 'tb-actions'
    Object.defineProperty(bar, 'offsetHeight', { value: 73 })
    const { container } = render(<ScrollHint />)
    expect(hint(container)).toHaveStyle({ bottom: '73px' })
    bar.remove()
  })

  it('is hidden from assistive tech', () => {
    const { container } = render(<ScrollHint />)
    expect(hint(container)).toHaveAttribute('aria-hidden', 'true')
  })
})
