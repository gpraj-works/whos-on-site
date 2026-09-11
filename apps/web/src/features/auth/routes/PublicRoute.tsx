import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'

import { LoadingState } from '../../../components/common/LoadingState'
import { useAuth } from '../context/AuthContext'

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
