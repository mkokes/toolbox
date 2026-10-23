import { fireEvent, screen, within } from '@testing-library/react'
import type { UserEvent } from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { choose } from '../test/antd'
import { renderRoute } from '../test/render'

const resultValue = (label: string) => {
  const stat = screen.getByText(label, { selector: '.tb-result-label' }).closest('.tb-result') as HTMLElement
  return within(stat).getByText(/./, { selector: '.tb-result-value' }).textContent
}

const summary = () => screen.getByTestId('drivetrain-summary').textContent

async function pickE50(user: UserEvent) {
  await choose(user, /select a manufacturer/i, 'Puch')
  await choose(user, /select a model/i, 'E50')
}

const E50_RESULTS = '/gearing?make=Puch&model=E50&front=16&rear=45&wheel=17&tire=2.25&view=results'

describe('Gearing setup', () => {
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

  it('summarises the stock drivetrain instead of showing four dropdowns', async () => {
    const { user } = renderRoute('/gearing')
    await pickE50(user)

    expect(summary()).toBe('16T / 45T · 17″ rim · 2.25″ tire')
    expect(screen.getByText('Stock')).toBeInTheDocument()
    expect(screen.queryByLabelText(/select a front sprocket/i)).not.toBeInTheDocument()
  })

  it('lets you edit the drivetrain, and marks it modified', async () => {
    const { user, router } = renderRoute('/gearing')
    await pickE50(user)
    await user.click(screen.getByRole('button', { name: 'Edit' }))
    expect(screen.getByTitle('16 Tooth')).toBeInTheDocument()

    await choose(user, /select a front sprocket/i, '15 Tooth')
    await user.click(screen.getByRole('button', { name: 'Done' }))

    expect(summary()).toBe('15T / 45T · 17″ rim · 2.25″ tire')
    expect(screen.getByText('Modified')).toBeInTheDocument()
    expect(router.state.location.search).toContain('front=15')
  })

  it('asks for a version when a model has several', async () => {
    const { user } = renderRoute('/gearing')
    await choose(user, /select a manufacturer/i, 'Puch')
    await choose(user, /select a model/i, 'ZA50')
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument()

    await choose(user, /select a version/i, '1.5 - 2 HP')
    expect(summary()).toBe('18T / 40T · 17″ rim · 2.25″ tire')
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument()
  })

  it('uses pulleys for Vespa', async () => {
    const { user } = renderRoute('/gearing')
    await choose(user, /select a manufacturer/i, 'Vespa')
    await choose(user, /select a model/i, 'Piaggio')
    await choose(user, /select a version/i, '7:1 Rear Hub')

    expect(summary()).toBe('50 / 95 mm pulleys · 16″ rim · 2.25″ tire')
    await user.click(screen.getByRole('button', { name: 'Edit' }))
    expect(screen.getByLabelText(/select a front pulley/i)).toBeInTheDocument()
    expect(screen.getByTitle('50mm Pulley')).toBeInTheDocument()
  })

  it('resets the model when the manufacturer changes', async () => {
    const { user } = renderRoute('/gearing')
    await pickE50(user)
    await choose(user, /select a manufacturer/i, 'Tomos')

    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument()
    expect(screen.getByText('Please Select An Engine Model')).toBeInTheDocument()
  })

  it('labels wheel and tire sizes in millimetres in metric', async () => {
    localStorage.setItem('toolbox.units', 'metric')
    const { user } = renderRoute('/gearing')
    await pickE50(user)
    expect(summary()).toBe('16T / 45T · 17 in (432 mm) rim · 57 mm tire')
  })

  it('keeps Back and Next in a sticky action bar', async () => {
    const { user } = renderRoute('/gearing')
    await pickE50(user)
    const bar = screen.getByRole('button', { name: 'Next' }).closest('.tb-actions')
    expect(bar).toBeInTheDocument()
    expect(within(bar as HTMLElement).getByRole('button', { name: 'Back' })).toBeInTheDocument()
  })
})

describe('Gearing custom engine', () => {
  it('calculates from a typed-in engine reduction', async () => {
    const { user } = renderRoute('/gearing')
    await choose(user, /select a manufacturer/i, 'Other / custom')
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument()

    // 5.05:1 is the E50's internal ratio (1 / 0.19802), and the custom defaults are the E50's drivetrain.
    await user.type(screen.getByLabelText(/engine reduction/i), '5.05')
    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(resultValue('RPM')).toBe('6662')
    expect(resultValue('Crank To Wheel Ratio')).toBe('14.20:1')
    expect(screen.getByText('Custom 5.05:1 16/45')).toBeInTheDocument()
  })
})

describe('Gearing results', () => {
  it('calculates the ratio and RPM for a stock Puch E50', async () => {
    const { user } = renderRoute('/gearing')
    await pickE50(user)
    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.getByRole('heading', { name: 'Calculate RPM & MPH' })).toBeInTheDocument()
    expect(resultValue('Crank To Wheel Ratio')).toBe('14.20:1')
    expect(resultValue('RPM')).toBe('6662')
    expect(screen.getByRole('img', { name: 'Engine speed 6662 RPM' })).toBeInTheDocument()
    expect(resultValue('MPH')).toBe('30')
  })

  it('opens straight to the results from a link', () => {
    renderRoute(E50_RESULTS)
    expect(resultValue('RPM')).toBe('6662')
    expect(screen.getByText('Puch E50 16/45')).toBeInTheDocument()
  })

  it('falls back to the form for an incomplete or invalid link', () => {
    renderRoute('/gearing?make=Puch&model=Nope&view=results')
    expect(screen.getByRole('heading', { name: 'Configure Your Bike' })).toBeInTheDocument()
    expect(screen.getByLabelText(/select a model/i)).toBeInTheDocument()
  })

  it('updates RPM as the speed slider moves', () => {
    renderRoute(E50_RESULTS)
    // rc-slider reads the legacy keyCode, which user-event doesn't set.
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight', keyCode: 39, which: 39 })
    expect(resultValue('MPH')).toBe('31')
    expect(resultValue('RPM')).toBe('6884')
  })

  it('shows km/h in metric without changing the RPM', async () => {
    const { user } = renderRoute(E50_RESULTS)
    await user.click(screen.getByText('Metric'))

    expect(screen.getByRole('heading', { name: 'Calculate RPM & KM/H' })).toBeInTheDocument()
    expect(resultValue('KM/H')).toBe('48')
    expect(resultValue('RPM')).toBe('6662')
  })

  it('goes back to the bike setup from the results', async () => {
    const { user } = renderRoute(E50_RESULTS)
    await user.click(screen.getByRole('button', { name: 'Back' }))

    expect(screen.getByRole('heading', { name: 'Configure Your Bike' })).toBeInTheDocument()
    expect(summary()).toBe('16T / 45T · 17″ rim · 2.25″ tire')
  })

  it('copies a share link that reopens the same results', async () => {
    const { user } = renderRoute(E50_RESULTS)
    await user.click(screen.getByRole('button', { name: /share/i }))

    const link = await navigator.clipboard.readText()
    expect(link).toMatch(/#\/gearing\?make=Puch&model=E50&front=16&rear=45&wheel=17&tire=2\.25&view=results$/)
    expect(await screen.findByText('Link copied')).toBeInTheDocument()
  })
})

describe('My bikes', () => {
  it('saves a setup and reopens it from the list', async () => {
    const { user } = renderRoute(E50_RESULTS)
    await user.click(screen.getByRole('button', { name: /save bike/i }))
    const name = screen.getByLabelText('Name')
    expect(name).toHaveValue('Puch E50 16/45')
    await user.clear(name)
    await user.type(name, 'Blue Puch')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByText('Saved to My bikes')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByText('My bikes')).toBeInTheDocument()
    expect(screen.getByText('Blue Puch')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Open Blue Puch' }))
    expect(resultValue('RPM')).toBe('6662')
  })

  it('remembers bikes between visits and lets you delete one', async () => {
    localStorage.setItem(
      'toolbox.bikes',
      JSON.stringify([
        { id: 'a', name: 'Shop bike', params: 'make=Tomos&model=A3&front=26&rear=22&wheel=16&tire=2.25' },
      ]),
    )
    const { user } = renderRoute('/gearing')
    expect(screen.getByText('Shop bike')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Delete Shop bike' }))
    await user.click(await screen.findByRole('button', { name: 'Delete' }))
    expect(screen.queryByText('My bikes')).not.toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('toolbox.bikes')!)).toEqual([])
  })
})
