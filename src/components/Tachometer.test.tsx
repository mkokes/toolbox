import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ThemeProvider, ThemedConfig } from '../context/ThemeContext'
import Tachometer from './Tachometer'

const renderGauge = (rpm: number) =>
  render(
    <ThemeProvider>
      <ThemedConfig>
        <Tachometer rpm={rpm} />
      </ThemedConfig>
    </ThemeProvider>,
  )

describe('Tachometer', () => {
  it('is announced as one image with the engine speed', () => {
    renderGauge(6662)
    expect(screen.getByRole('img', { name: 'Engine speed 6662 RPM' })).toBeInTheDocument()
  })

  it('shows the speed as a big readout with an RPM caption', () => {
    const { container } = renderGauge(6662)
    const readout = container.querySelector('.tb-gauge-readout')!
    expect(readout).toHaveTextContent('6662')
    expect(readout).toHaveTextContent('RPM')
  })

  it('fills the dial up to the needle', () => {
    renderGauge(6662)
    expect(screen.getByTestId('gauge-progress')).toBeInTheDocument()
  })

  it('has no progress arc at 0 RPM', () => {
    renderGauge(0)
    expect(screen.queryByTestId('gauge-progress')).not.toBeInTheDocument()
  })

  it('copes with a speed above the top of the dial', () => {
    const { container } = renderGauge(15000)
    expect(container.querySelector('.tb-gauge-readout')).toHaveTextContent('15000')
    expect(screen.getByTestId('gauge-progress').getAttribute('d')).not.toMatch(/NaN/)
  })

  it('uses a smaller readout for five-digit speeds so it clears the dial labels', () => {
    const { container, rerender } = renderGauge(9999)
    expect(container.querySelector('.tb-gauge-value')).not.toHaveClass('tb-gauge-value--long')
    rerender(
      <ThemeProvider>
        <ThemedConfig>
          <Tachometer rpm={10000} />
        </ThemedConfig>
      </ThemeProvider>,
    )
    expect(container.querySelector('.tb-gauge-value')).toHaveClass('tb-gauge-value--long')
  })
})
