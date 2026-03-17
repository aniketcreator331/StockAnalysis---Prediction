import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { CurrencyProvider } from './contexts/CurrencyContext.jsx'
import { UserDataProvider } from './contexts/UserDataContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CurrencyProvider>
      <UserDataProvider>
        <App />
      </UserDataProvider>
    </CurrencyProvider>
  </StrictMode>,
)
