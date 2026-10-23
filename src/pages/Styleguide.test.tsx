import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderRoute } from '../test/render'
import { colors } from '../theme/tokens'

describe('Styleguide', () => {
  it('renders every brand color from the tokens', async () => {
    renderRoute('/styleguide')
    expect(await screen.findByRole('heading', { name: 'Styleguide' })).toBeInTheDocument()
    for (const hex of Object.values(colors)) {
      expect(screen.getAllByText(hex).length).toBeGreaterThan(0)
    }
  })

  it('flags red text on the background as low contrast', async () => {
    renderRoute('/styleguide')
    expect(await screen.findByText('2.61:1 on background')).toBeInTheDocument()
  })
})
