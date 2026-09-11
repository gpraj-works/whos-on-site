import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'

import { LoadingState } from '../common/LoadingState'
import { useAuth } from './AuthContext'

export const PublicRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingState message="Checking session..." />
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
