import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderRoute } from '../test/render'

describe('Home', () => {
  it('offers the gearing and gas mixing tools only', () => {
    renderRoute('/')
    expect(screen.getByRole('heading', { name: /choose your task/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Calculate Gearing' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mix Gas' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /carb/i })).not.toBeInTheDocument()
  })

  it('opens a tool and comes back', async () => {
    const { user, router } = renderRoute('/')
    await user.click(screen.getByRole('button', { name: 'Mix Gas' }))
    expect(router.state.location.pathname).toBe('/mix')
    expect(screen.getByRole('heading', { name: /mix your oil/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Back' }))
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
