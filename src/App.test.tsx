import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderRoute } from './test/render'

describe('Layout header', () => {
  it('holds the title link and the theme switch together, on every page', () => {
    for (const path of ['/', '/gearing', '/mix']) {
      const { unmount } = renderRoute(path)
      const header = screen.getByRole('banner')
      expect(within(header).getByRole('link', { name: 'Moped Toolbox' })).toBeInTheDocument()
      expect(within(header).getByRole('radio', { name: 'Dark theme' })).toBeInTheDocument()
      unmount()
    }
  })

  it('shares the header row between the title and the switch', () => {
    renderRoute('/')
    const row = screen.getByRole('banner').firstElementChild!
    expect(within(row as HTMLElement).getByRole('link', { name: 'Moped Toolbox' })).toBeInTheDocument()
    expect(within(row as HTMLElement).getByRole('radio', { name: 'Light theme' })).toBeInTheDocument()
  })
})
