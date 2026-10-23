import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import StepBars from './StepBars'

describe('StepBars', () => {
  it('lists every step, with its position and title available as text', () => {
    render(<StepBars current={0} steps={['Bike', 'RPM & Speed']} />)
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText('Step 1 of 2: Bike')).toBeInTheDocument()
    expect(screen.getByText('Step 2 of 2: RPM & Speed')).toBeInTheDocument()
  })

  it('marks only the current step as current', () => {
    render(<StepBars current={1} steps={['Bike', 'RPM & Speed']} />)
    const [first, second] = screen.getAllByRole('listitem')
    expect(first).not.toHaveAttribute('aria-current')
    expect(second).toHaveAttribute('aria-current', 'step')
  })

  it('fills the bars up to and including the current step', () => {
    render(<StepBars current={1} steps={['Bike', 'RPM & Speed', 'Done']} />)
    const items = screen.getAllByRole('listitem')
    expect(items.map((li) => li.classList.contains('tb-step--filled'))).toEqual([true, true, false])
  })
})
