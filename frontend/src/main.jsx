import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'

import { CurrencyProvider } from './contexts/CurrencyContext.jsx'
import { UserDataProvider } from './contexts/UserDataContext.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="799612911628-aaqbfkc08lbeiq6irb3ulltml24ougtc.apps.googleusercontent.com">
      <AuthProvider>
        <CurrencyProvider>
          <UserDataProvider>
            <App />
          </UserDataProvider>
        </CurrencyProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
