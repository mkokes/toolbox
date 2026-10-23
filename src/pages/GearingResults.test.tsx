import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderRoute } from '../test/render'

const E50_RESULTS = '/gearing?make=Puch&model=E50&front=16&rear=45&wheel=17&tire=2.25&view=results'

/** The compare table's cells for a row, by its label (e.g. "RPM at 30 mph"). */
const compareRow = (label: RegExp | string) => {
  const row = screen.getByText(label).closest('tr') as HTMLElement
  return within(row)
    .getAllByRole('cell')
    .map((c) => c.textContent)
}

describe('Top speed at a target RPM', () => {
  it('defaults to 8,000 RPM', () => {
    renderRoute(E50_RESULTS)
    expect(screen.getByText('≈ 36 mph at 8,000 RPM')).toBeInTheDocument()
  })

  it('reads the target RPM from the link', () => {
    renderRoute(`${E50_RESULTS}&rpm=9500`)
    expect(screen.getByText('≈ 43 mph at 9,500 RPM')).toBeInTheDocument()
    expect(screen.getByLabelText(/top speed at a target rpm/i)).toHaveValue('9500')
  })

  it('updates as you type a new target and keeps it in the link', async () => {
    const { user, router } = renderRoute(E50_RESULTS)
    const input = screen.getByLabelText(/top speed at a target rpm/i)
    await user.clear(input)
    await user.type(input, '9500')

    expect(screen.getByText('≈ 43 mph at 9,500 RPM')).toBeInTheDocument()
    expect(router.state.location.search).toContain('rpm=9500')
  })

  it('shows km/h in metric', () => {
    localStorage.setItem('toolbox.units', 'metric')
    renderRoute(E50_RESULTS)
    expect(screen.getByText('≈ 58 km/h at 8,000 RPM')).toBeInTheDocument()
  })
})

describe('Compare gearing', () => {
  it('starts collapsed', () => {
    renderRoute(E50_RESULTS)
    expect(screen.queryByText('What if')).not.toBeInTheDocument()
  })

  it('compares against two teeth more at the rear by default', async () => {
    const { user } = renderRoute(E50_RESULTS)
    await user.click(screen.getByText(/compare gearing/i))

    expect(screen.getByTitle('47 Tooth')).toBeInTheDocument()
    expect(compareRow('Crank to wheel')).toEqual(['Crank to wheel', '14.20:1', '14.83:1', '+0.63'])
    expect(compareRow('RPM at 30 mph')).toEqual(['RPM at 30 mph', '6662', '6958', '+296'])
    expect(compareRow('MPH at 8,000 RPM')).toEqual(['MPH at 8,000 RPM', '36', '34', '−2'])
  })

  it('nudges the alternative with the quick buttons', async () => {
    const { user } = renderRoute(E50_RESULTS)
    await user.click(screen.getByText(/compare gearing/i))
    await user.click(screen.getByRole('button', { name: 'Rear −1' }))
    await user.click(screen.getByRole('button', { name: 'Rear −1' }))

    // Back to the current gearing: no change, nothing to apply.
    expect(compareRow('RPM at 30 mph')).toEqual(['RPM at 30 mph', '6662', '6662', '0'])
    expect(screen.getByRole('button', { name: 'Use this gearing' })).toBeDisabled()
  })

  it('applies the alternative to the setup', async () => {
    const { user, router } = renderRoute(E50_RESULTS)
    await user.click(screen.getByText(/compare gearing/i))
    await user.click(screen.getByRole('button', { name: 'Use this gearing' }))

    expect(router.state.location.search).toContain('rear=47')
    expect(screen.getByText('Puch E50 16/47')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Engine speed 6958 RPM' })).toBeInTheDocument()
  })
})
