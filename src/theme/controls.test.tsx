import { describe, expect, it } from 'vitest'
import { setSystemDark } from '../test/matchMedia'
import { renderRoute } from '../test/render'
import { brand } from './tokens'

describe('form controls', () => {
  it('render as filled tiles rather than boxed web inputs', () => {
    renderRoute('/gearing')
    expect(document.querySelector('.ant-select-filled')).not.toBeNull()
    expect(document.querySelector('.ant-select-outlined')).toBeNull()
  })

  it('fills number inputs too', () => {
    renderRoute('/mix')
    expect(document.querySelector('.ant-input-number-filled')).not.toBeNull()
    expect(document.querySelector('.ant-input-number-outlined')).toBeNull()
  })

  it.each(['light', 'dark'] as const)(
    'rings a focused tile in the %s heading red, since the 1px border alone is too faint',
    (mode) => {
      setSystemDark(mode === 'dark')
      renderRoute('/gearing')
      const css = [...document.querySelectorAll('style')]
        .map((el) => el.textContent ?? '')
        .join('\n')
        .toLowerCase()
      const color = brand[mode].colorHeading.toLowerCase()
      const hasRing = (selector: string) =>
        css.split('}').some((rule) => rule.includes(selector) && rule.includes('box-shadow') && rule.includes(color))
      const missing = ['.ant-select-focused', '.ant-input-number-focused', '.ant-input-filled:focus'].filter(
        (selector) => !hasRing(selector),
      )
      expect(missing).toEqual([])
    },
  )
})
