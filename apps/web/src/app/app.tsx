import React from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { AuthProvider } from '../components/auth/AuthContext'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import { PublicRoute } from '../components/auth/PublicRoute'
import { Customers } from '../pages/Customers'
import { Dashboard } from '../pages/Dashboard'
import { DesignSystem } from '../pages/DesignSystem'
import { Jobs } from '../pages/Jobs'
import { Login } from '../pages/Login'
import { Settings } from '../pages/Settings'
import { Technicians } from '../pages/Technicians'
import { store } from '../store'
import { queryClient } from './query/client'
import { ThemeProvider } from './theme/ThemeContext'

export const App: React.FC = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider initialCompanyColor="teal">
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Unauthenticated Routes */}
                <Route element={<PublicRoute />}>
                  <Route path="/login" element={<Login />} />
                </Route>

                {/* Protected Authenticated Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/jobs" element={<Jobs />} />
                  <Route path="/dispatch" element={<Jobs />} />
                  <Route path="/technicians" element={<Technicians />} />
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/design-system" element={<DesignSystem />} />
                </Route>

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  )
}
