import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource-variable/manrope'
// Styles globaux avant ceux des modules : un module peut affiner un composant commun.
import './shared/styles/global.css'
import { App } from './app/App'
import { AuthProvider } from './lib/data'
import { AuthGate } from './shared/components/AuthGate'
import { PersonGate } from './shared/person'
import { ThemeSync } from './shared/theme'
import { ToastProvider } from './shared/ui'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeSync />
    <BrowserRouter>
      <AuthProvider>
        <AuthGate>
          <PersonGate>
            <ToastProvider>
              <App />
            </ToastProvider>
          </PersonGate>
        </AuthGate>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
