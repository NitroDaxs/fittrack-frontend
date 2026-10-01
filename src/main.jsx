import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { WorkoutProvider } from './context/WorkoutContext'
import { TaxonomyProvider } from './context/TaxonomyContext'
import { UnitProvider } from './context/UnitContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <WorkoutProvider>
          <TaxonomyProvider>
            <UnitProvider>
              <App />
            </UnitProvider>
          </TaxonomyProvider>
        </WorkoutProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
