import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfigProvider } from 'antd'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { routes } from '../App'
import { UnitsProvider } from '../context/UnitsContext'
import { antdTheme } from '../theme/antdTheme'

/** Render the real app (theme, units, routes) starting at `path`. */
export function renderRoute(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  // antd animates dropdowns; skip the pointer-events check that trips on mid-animation styles.
  const user = userEvent.setup({ pointerEventsCheck: 0 })
  const utils = render(
    <ConfigProvider theme={antdTheme}>
      <UnitsProvider>
        <RouterProvider router={router} />
      </UnitsProvider>
    </ConfigProvider>,
  )
  return { ...utils, user, router }
}
