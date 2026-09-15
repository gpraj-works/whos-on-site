import React from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { AuthProvider } from '../components/auth/AuthContext'
import { DispatcherOnly } from '../components/auth/DispatcherOnly'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import { PublicRoute } from '../components/auth/PublicRoute'
import { TechnicianOnly } from '../components/auth/TechnicianOnly'
import { Analytics } from '../pages/Analytics'
import { CustomerStatusPage } from '../pages/CustomerStatusPage'
import { Customers } from '../pages/Customers'
import { Dashboard } from '../pages/Dashboard'
import { Jobs } from '../pages/Jobs'
import { Login } from '../pages/Login'
import { Settings } from '../pages/Settings'
import { TechnicianJobs } from '../pages/TechnicianJobs'
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
                {/* Public Customer Status Link */}
                <Route path="/status/:token" element={<CustomerStatusPage />} />

                {/* Public Unauthenticated Routes */}
                <Route element={<PublicRoute />}>
                  <Route path="/login" element={<Login />} />
                </Route>

                {/* Protected Authenticated Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route
                    path="/my-jobs"
                    element={
                      <TechnicianOnly>
                        <TechnicianJobs />
                      </TechnicianOnly>
                    }
                  />
                  <Route
                    path="/jobs"
                    element={
                      <DispatcherOnly>
                        <Jobs />
                      </DispatcherOnly>
                    }
                  />
                  <Route
                    path="/analytics"
                    element={
                      <DispatcherOnly>
                        <Analytics />
                      </DispatcherOnly>
                    }
                  />
                  <Route path="/technicians" element={<Technicians />} />
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/settings" element={<Settings />} />
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
