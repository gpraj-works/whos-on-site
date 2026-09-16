import React from 'react'
import { Navigate } from 'react-router-dom'
import { UserRole } from '@whosonsite/shared'

import { LoadingState } from '../common/LoadingState'
import { useAuth } from './AuthContext'

interface AgentOnlyProps {
  children: React.ReactNode
}

export const AgentOnly: React.FC<AgentOnlyProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return <LoadingState message="Verifying permissions..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const allowedRoles = [UserRole.AGENT, UserRole.OWNER, UserRole.ADMIN, UserRole.DISPATCHER]
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
