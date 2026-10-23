import { Flex, theme } from 'antd'
import { Link, Outlet, createHashRouter, type RouteObject } from 'react-router-dom'
import ScrollHint from './components/ScrollHint'
import ThemeToggle from './components/ThemeToggle'
import { useAppStyles } from './theme/useAppStyles'
import Home from './pages/Home'
import Gearing from './pages/Gearing'
import MixGas from './pages/MixGas'

function Layout() {
  useAppStyles()
  const { token } = theme.useToken()
  return (
    <div className="tb-wrapper">
      <header>
        <Flex align="center" justify="space-between" gap={token.marginXS} style={{ paddingTop: token.paddingXS }}>
          <h1 className="tb-title">
            <Link to="/">
              <Flex align="center" gap={token.marginXS}>
                <img
                  src={`${import.meta.env.BASE_URL}icon.svg`}
                  alt=""
                  width={token.controlHeight}
                  height={token.controlHeight}
                />
                Moped Toolbox
              </Flex>
            </Link>
          </h1>
          <ThemeToggle />
        </Flex>
      </header>
      <main>
        <Outlet />
      </main>
      <ScrollHint />
    </div>
  )
}

// Exported so tests can mount the same routes in a memory router.
export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/gearing', element: <Gearing /> },
      { path: '/mix', element: <MixGas /> },
      { path: '/styleguide', lazy: async () => ({ Component: (await import('./pages/Styleguide')).default }) },
      { path: '*', element: <Home /> },
    ],
  },
]

// Hash routing: GitHub Pages has no SPA fallback, so deep links must not depend on server rewrites.
export const router = createHashRouter(routes)
