import { Link, Outlet, createHashRouter, type RouteObject } from 'react-router-dom'
import Home from './pages/Home'
import Gearing from './pages/Gearing'
import MixGas from './pages/MixGas'

function Layout() {
  return (
    <div className="tb-wrapper">
      <header>
        <h1 className="tb-title">
          <Link to="/">Moped Toolbox</Link>
        </h1>
      </header>
      <main>
        <Outlet />
      </main>
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
