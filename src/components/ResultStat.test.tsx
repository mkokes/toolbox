import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ResultStat from './ResultStat'

describe('ResultStat', () => {
  it('shows the value and its label, announcing value changes politely', () => {
    render(<ResultStat label="Crank To Wheel Ratio" value="14.20:1" />)
    expect(screen.getByText('14.20:1')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByText('Crank To Wheel Ratio')).toBeInTheDocument()
  })

  it('is a tile, so two of them can sit side by side', () => {
    const { container } = render(<ResultStat label="MPH" value={30} />)
    expect(container.firstElementChild).toHaveClass('tb-stat-tile')
  })
})
