import React from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { AuthProvider } from '../components/auth/AuthContext'
import { ManagementOnly } from '../components/auth/ManagementOnly'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import { PublicRoute } from '../components/auth/PublicRoute'
import { AgentOnly } from '../components/auth/AgentOnly'
import { Analytics } from '../pages/Analytics'
import { CustomerStatusPage } from '../pages/CustomerStatusPage'
import { Customers } from '../pages/Customers'
import { Dashboard } from '../pages/Dashboard'
import { Jobs } from '../pages/Jobs'
import { LandingPage } from '../pages/LandingPage'
import { Login } from '../pages/Login'
import { Register } from '../pages/Register'
import { Settings } from '../pages/Settings'
import { AgentJobs } from '../pages/AgentJobs'
import { Agents } from '../pages/Agents'
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
                {/* Public Homepage (marketing) */}
                <Route path="/" element={<LandingPage />} />

                {/* Public Customer Status Link */}
                <Route path="/status/:token" element={<CustomerStatusPage />} />

                {/* Public Unauthenticated Routes */}
                <Route element={<PublicRoute />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Route>

                {/* Protected Authenticated Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route
                    path="/my-jobs"
                    element={
                      <AgentOnly>
                        <AgentJobs />
                      </AgentOnly>
                    }
                  />
                  <Route
                    path="/jobs"
                    element={
                      <ManagementOnly>
                        <Jobs />
                      </ManagementOnly>
                    }
                  />
                  <Route
                    path="/analytics"
                    element={
                      <ManagementOnly>
                        <Analytics />
                      </ManagementOnly>
                    }
                  />
                  <Route path="/agents" element={<Agents />} />
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>

                {/* Catch-all redirect to the public homepage */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  )
}
