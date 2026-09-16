import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { UserRole } from '@whosonsite/shared'

import { LoadingState } from '../common/LoadingState'
import { AppLayout } from '../layout/AppLayout'
import { useAuth } from './AuthContext'

interface ProtectedRouteProps {
  allowedRoles?: UserRole[]
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <LoadingState message="Restoring session..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  )
}
