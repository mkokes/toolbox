import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { choose } from '../test/antd'
import { renderRoute } from '../test/render'

const gasInput = () => screen.getByLabelText(/how much gas/i)

describe('MixGas', () => {
  it('shows nothing until an amount is entered', () => {
    renderRoute('/mix')
    expect(screen.queryByText(/of oil to your gas/)).not.toBeInTheDocument()
    expect(screen.getByText('50 : 1')).toBeInTheDocument()
  })

  it('puts the Back button in the footer bar', () => {
    renderRoute('/mix')
    expect(screen.getByRole('button', { name: 'Back' }).closest('.tb-actions')).toBeInTheDocument()
  })

  it('works out oil for gallons at the default 50:1', async () => {
    const { user } = renderRoute('/mix')
    await user.type(gasInput(), '1')
    expect(screen.getByText('Add 76ml (2.6 fl oz) of oil to your gas')).toBeInTheDocument()
  })

  it('recalculates when the ratio changes', async () => {
    const { user } = renderRoute('/mix')
    await user.type(gasInput(), '1')
    await choose(user, /fuel to oil ratio/i, '40 : 1')
    expect(screen.getByText('Add 95ml (3.2 fl oz) of oil to your gas')).toBeInTheDocument()
  })

  it('converts the entered amount when switching to metric', async () => {
    const { user } = renderRoute('/mix')
    await user.type(gasInput(), '1')
    await user.click(screen.getByText('Metric'))

    expect(screen.getByLabelText(/how much gas\? \(litres\)/i)).toHaveValue('3.79')
    expect(screen.getByText('Add 76ml of oil to your gas')).toBeInTheDocument()
  })

  it('takes litres in metric', async () => {
    localStorage.setItem('toolbox.units', 'metric')
    const { user } = renderRoute('/mix')
    await user.type(gasInput(), '5')
    expect(screen.getByText('Add 100ml of oil to your gas')).toBeInTheDocument()
  })

  it('clears the result when the amount is cleared', async () => {
    const { user } = renderRoute('/mix')
    await user.type(gasInput(), '2')
    expect(screen.getByText(/of oil to your gas/)).toBeInTheDocument()
    await user.clear(gasInput())
    expect(screen.queryByText(/of oil to your gas/)).not.toBeInTheDocument()
  })
})
