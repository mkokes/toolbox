import { describe, expect, it } from 'vitest'
import { renderRoute } from '../test/render'

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
})
