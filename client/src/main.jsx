import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Login from './components/Login/Login.jsx'
import Signup from './components/Signup/Signup.jsx'
import ErrorBoundary from './components/ui/ErrorBoundary.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { ProtectedRoute, PublicOnlyRoute, RootRedirect } from './components/Auth/AuthGuard.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
            <Route path="/signup" element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />
            <Route path="/expenses" element={<ProtectedRoute><App /></ProtectedRoute>} />
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>
)
