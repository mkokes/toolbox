import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './App'
import { ThemeProvider, ThemedConfig } from './context/ThemeContext'
import { UnitsProvider } from './context/UnitsContext'
import { startUpdateChecks } from './pwaUpdates'

startUpdateChecks()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ThemedConfig>
        <UnitsProvider>
          <RouterProvider router={router} />
        </UnitsProvider>
      </ThemedConfig>
    </ThemeProvider>
  </StrictMode>,
)
