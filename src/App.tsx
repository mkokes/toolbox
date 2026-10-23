import { Link, Outlet, createHashRouter } from 'react-router-dom'
import Home from './pages/Home'
import Gearing from './pages/Gearing'
import CarbSizing from './pages/CarbSizing'
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
      <footer className="tb-footer">
        <a href="http://martysgarage.info/">Back to Marty's Garage</a>
        <Link to="/styleguide" className="tb-subtle">
          Styleguide
        </Link>
      </footer>
    </div>
  )
}

// Hash routing: GitHub Pages has no SPA fallback, so deep links must not depend on server rewrites.
export const router = createHashRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/gearing', element: <Gearing /> },
      { path: '/carb', element: <CarbSizing /> },
      { path: '/mix', element: <MixGas /> },
      { path: '/styleguide', lazy: async () => ({ Component: (await import('./pages/Styleguide')).default }) },
      { path: '*', element: <Home /> },
    ],
  },
])
