import { fireEvent, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { choose } from '../test/antd'
import { renderRoute } from '../test/render'

const resultValue = (label: string) => {
  const stat = screen.getByText(label, { selector: '.tb-result-label' }).closest('.tb-result') as HTMLElement
  return within(stat).getByText(/./, { selector: '.tb-result-value' }).textContent
}

describe('Gearing', () => {
  it('reveals the next field as each choice is made', async () => {
    const { user } = renderRoute('/gearing')
    expect(screen.queryByLabelText(/select a model/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument()

    await choose(user, /select a manufacturer/i, 'Puch')
    expect(screen.getByLabelText(/select a model/i)).toBeInTheDocument()

    await choose(user, /select a model/i, 'E50')
    // E50 has a single record, so no version step
    expect(screen.queryByLabelText(/select a version/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument()
  })

  it('pre-fills the engine defaults', async () => {
    const { user } = renderRoute('/gearing')
    await choose(user, /select a manufacturer/i, 'Puch')
    await choose(user, /select a model/i, 'E50')

    expect(screen.getByTitle('16 Tooth')).toBeInTheDocument()
    expect(screen.getByTitle('45 Tooth')).toBeInTheDocument()
    expect(screen.getByTitle('17 Inch')).toBeInTheDocument()
    expect(screen.getByTitle('2.25 Inch')).toBeInTheDocument()
  })

  it('asks for a version when a model has several', async () => {
    const { user } = renderRoute('/gearing')
    await choose(user, /select a manufacturer/i, 'Puch')
    await choose(user, /select a model/i, 'ZA50')
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument()

    await choose(user, /select a version/i, '1.5 - 2 HP')
    expect(screen.getByTitle('18 Tooth')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument()
  })

  it('uses pulleys for Vespa', async () => {
    const { user } = renderRoute('/gearing')
    await choose(user, /select a manufacturer/i, 'Vespa')
    await choose(user, /select a model/i, 'Piaggio')
    await choose(user, /select a version/i, '7:1 Rear Hub')

    expect(screen.getByLabelText(/select a front pulley/i)).toBeInTheDocument()
    expect(screen.getByTitle('50mm Pulley')).toBeInTheDocument()
    expect(screen.getByTitle('95mm Pulley')).toBeInTheDocument()
  })

  it('resets the model when the manufacturer changes', async () => {
    const { user } = renderRoute('/gearing')
    await choose(user, /select a manufacturer/i, 'Puch')
    await choose(user, /select a model/i, 'E50')
    await choose(user, /select a manufacturer/i, 'Tomos')

    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument()
    expect(screen.getByText('Please Select An Engine Model')).toBeInTheDocument()
  })

  it('calculates the ratio and RPM for a stock Puch E50', async () => {
    const { user } = renderRoute('/gearing')
    await choose(user, /select a manufacturer/i, 'Puch')
    await choose(user, /select a model/i, 'E50')
    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.getByRole('heading', { name: 'Calculate RPM & MPH' })).toBeInTheDocument()
    expect(resultValue('Crank To Wheel Ratio')).toBe('14.20:1')
    expect(resultValue('RPM')).toBe('6662')
    expect(screen.getByRole('img', { name: 'Engine speed 6662 RPM' })).toBeInTheDocument()
    expect(resultValue('MPH')).toBe('30')
  })

  it('updates RPM as the speed slider moves', async () => {
    const { user } = renderRoute('/gearing')
    await choose(user, /select a manufacturer/i, 'Puch')
    await choose(user, /select a model/i, 'E50')
    await user.click(screen.getByRole('button', { name: 'Next' }))

    // rc-slider reads the legacy keyCode, which user-event doesn't set.
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight', keyCode: 39, which: 39 })
    expect(resultValue('MPH')).toBe('31')
    expect(resultValue('RPM')).toBe('6884')
  })

  it('shows km/h in metric without changing the RPM', async () => {
    const { user } = renderRoute('/gearing')
    await choose(user, /select a manufacturer/i, 'Puch')
    await choose(user, /select a model/i, 'E50')
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByText('Metric'))

    expect(screen.getByRole('heading', { name: 'Calculate RPM & KM/H' })).toBeInTheDocument()
    expect(resultValue('KM/H')).toBe('48')
    expect(resultValue('RPM')).toBe('6662')
  })

  it('labels wheel and tire sizes in millimetres in metric', async () => {
    localStorage.setItem('toolbox.units', 'metric')
    const { user } = renderRoute('/gearing')
    await choose(user, /select a manufacturer/i, 'Puch')
    await choose(user, /select a model/i, 'E50')

    expect(screen.getByTitle('17 in (432 mm)')).toBeInTheDocument()
    expect(screen.getByTitle('57 mm')).toBeInTheDocument()
  })

  it('goes back to the bike setup from the results', async () => {
    const { user } = renderRoute('/gearing')
    await choose(user, /select a manufacturer/i, 'Puch')
    await choose(user, /select a model/i, 'E50')
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: 'Back' }))

    expect(screen.getByRole('heading', { name: 'Configure Your Bike' })).toBeInTheDocument()
    expect(screen.getByTitle('16 Tooth')).toBeInTheDocument()
  })
})
