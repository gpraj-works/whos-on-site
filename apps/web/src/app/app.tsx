import React from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { AuthProvider } from '../features/auth/context/AuthContext'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { ProtectedRoute } from '../features/auth/routes/ProtectedRoute'
import { PublicRoute } from '../features/auth/routes/PublicRoute'
import { JobsPage } from '../features/jobs/pages/JobsPage'
import { TechniciansPage } from '../features/technicians/pages/TechniciansPage'
import { DashboardPage } from '../pages/DashboardPage'
import { DesignSystemPage } from '../pages/DesignSystemPage'
import { SettingsPage } from '../pages/SettingsPage'
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
                  <Route path="/login" element={<LoginPage />} />
                </Route>

                {/* Protected Authenticated Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/jobs" element={<JobsPage />} />
                  <Route path="/technicians" element={<TechniciansPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/design-system" element={<DesignSystemPage />} />
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
