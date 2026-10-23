import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider } from 'antd'
import { RouterProvider } from 'react-router-dom'
import { antdTheme } from './theme/antdTheme'
import { cssVars } from './theme/tokens'
import { router } from './App'
import { UnitsProvider } from './context/UnitsContext'
import './theme/global.css'

for (const [name, value] of Object.entries(cssVars)) {
  document.documentElement.style.setProperty(name, value)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider theme={antdTheme}>
      <UnitsProvider>
        <RouterProvider router={router} />
      </UnitsProvider>
    </ConfigProvider>
  </StrictMode>,
)
