import { QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import './i18n'
import App from './router/index'
import { AuthProvider } from './context/AuthContext'
import { WorkoutProvider } from './context/WorkoutContext'
import { queryClient } from './services/queryClient'
import { UnitProvider } from './context/UnitContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <WorkoutProvider>
            <UnitProvider>
              <App />
              <Toaster position="top-right" richColors closeButton />
            </UnitProvider>
          </WorkoutProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)
