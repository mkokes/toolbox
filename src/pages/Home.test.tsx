import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderRoute } from '../test/render'

describe('Home', () => {
  it('offers the gearing and gas mixing tools only, as described cards', () => {
    renderRoute('/')
    expect(screen.getByRole('heading', { name: /choose your task/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /calculate gearing.*rpm and road speed/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /mix gas.*2-stroke oil/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /carb/i })).not.toBeInTheDocument()
  })

  it('opens a tool and comes back', async () => {
    const { user, router } = renderRoute('/')
    await user.click(screen.getByRole('link', { name: /mix gas/i }))
    expect(router.state.location.pathname).toBe('/mix')
    expect(screen.getByRole('heading', { name: /mix your oil/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Back' }))
    expect(router.state.location.pathname).toBe('/')
  })

  it('links the title, with its logo, back home', async () => {
    const { user, router } = renderRoute('/gearing')
    await user.click(screen.getByRole('link', { name: 'Moped Toolbox' }))
    expect(router.state.location.pathname).toBe('/')
  })

  it('sends unknown paths home', () => {
    renderRoute('/carb')
    expect(screen.getByRole('heading', { name: /choose your task/i })).toBeInTheDocument()
  })

  it('has no footer links', () => {
    renderRoute('/')
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /garage|styleguide/i })).not.toBeInTheDocument()
  })
})
