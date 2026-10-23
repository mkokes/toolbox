import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { routes } from '../App'
import { ThemeProvider, ThemedConfig } from '../context/ThemeContext'
import { UnitsProvider } from '../context/UnitsContext'

/** Render the real app (theme, units, routes) starting at `path`. */
export function renderRoute(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  // antd animates dropdowns; skip the pointer-events check that trips on mid-animation styles.
  const user = userEvent.setup({ pointerEventsCheck: 0 })
  const utils = render(
    <ThemeProvider>
      <ThemedConfig>
        <UnitsProvider>
          <RouterProvider router={router} />
        </UnitsProvider>
      </ThemedConfig>
    </ThemeProvider>,
  )
  return { ...utils, user, router }
}
