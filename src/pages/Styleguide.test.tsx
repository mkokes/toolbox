import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { contrast } from '../lib/contrast'
import { renderRoute } from '../test/render'
import { brand, palettes } from '../theme/tokens'

const roleHex = (mode: 'dark' | 'light', key: string) =>
  (key in brand[mode] ? brand[mode][key as 'gaugeTrack'] : palettes[mode][key as 'colorBgContainer']) as string

describe('Styleguide', () => {
  it('previews both themes with their colors from the tokens', async () => {
    renderRoute('/styleguide')
    expect(await screen.findByRole('heading', { name: 'Styleguide' })).toBeInTheDocument()

    for (const mode of ['dark', 'light'] as const) {
      const panel = within(screen.getByTestId(`palette-${mode}`))
      // Light mode uses the same red for headings and buttons, so a hex can appear more than once.
      for (const hex of [palettes[mode].colorBgLayout, brand[mode].colorHeading, brand[mode].colorAccent]) {
        expect(panel.getAllByText(hex as string).length).toBeGreaterThan(0)
      }
    }
  })

  it('shows every color passing contrast in both themes', async () => {
    renderRoute('/styleguide')
    await screen.findByRole('heading', { name: 'Styleguide' })
    // The dark-mode heading red was 2.61:1 in v2.0.0; it's now lightened to pass for large text.
    const headingRatio = contrast(brand.dark.colorHeading, palettes.dark.colorBgLayout as string).toFixed(2)
    expect(within(screen.getByTestId('palette-dark')).getByText(`${headingRatio}:1`)).toBeInTheDocument()
    for (const mode of ['dark', 'light']) {
      const panel = screen.getByTestId(`palette-${mode}`)
      expect(panel.querySelectorAll('.ant-tag-error')).toHaveLength(0)
      expect(panel.querySelectorAll('.ant-tag-success').length).toBeGreaterThan(0)
    }
  })

  it('documents the surface, muted text and gauge colors for both themes', async () => {
    renderRoute('/styleguide')
    await screen.findByRole('heading', { name: 'Styleguide' })
    for (const mode of ['dark', 'light'] as const) {
      const panel = within(screen.getByTestId(`palette-${mode}`))
      for (const key of ['colorBgContainer', 'colorBgElevated', 'colorTextSecondary', 'gaugeTrack', 'needle']) {
        expect(panel.getByText(key)).toBeInTheDocument()
        expect(panel.getAllByText(roleHex(mode, key)).length).toBeGreaterThan(0)
      }
    }
  })

  it('shows the new components in their own sections', async () => {
    renderRoute('/styleguide')
    await screen.findByRole('heading', { name: 'Styleguide' })
    for (const name of ['Gauge', 'Stat tiles', 'Controls', 'Footer bar']) {
      expect(screen.getByRole('heading', { name })).toBeInTheDocument()
    }
    expect(screen.getByRole('img', { name: /engine speed/i })).toBeInTheDocument()
    expect(screen.getByText('Step 1 of 2: Bike')).toBeInTheDocument()
  })
})
