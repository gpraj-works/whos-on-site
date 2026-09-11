import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { AuthUser, CompanyDto, LoginRequest, RegisterRequest, ThemeColorType } from '@routeboard/shared'
import { useAppTheme } from '../../../app/theme/ThemeContext'
import { setAccessToken, setOnAuthFailure } from '../../../lib/api'
import * as authApi from '../api/authApi'
import { queryClient } from '../../../app/query/client'

interface AuthContextType {
  user: AuthUser | null
  company: CompanyDto | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [company, setCompany] = useState<CompanyDto | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const { setPrimaryColor } = useAppTheme()

  const handleAuthSuccess = (res: { user: AuthUser; company?: CompanyDto; accessToken: string }) => {
    setAccessToken(res.accessToken)
    setUser(res.user)
    if (res.company) {
      setCompany(res.company)
      if (res.company.primaryColor) {
        setPrimaryColor(res.company.primaryColor as ThemeColorType)
      }
    }
  }

  const logout = useCallback(async () => {
    try {
      await authApi.logoutApi()
    } catch {
      // Ignore logout network errors
    } finally {
      setAccessToken(null)
      setUser(null)
      setCompany(null)
      queryClient.clear()
    }
  }, [])

  // Register auth failure callback with API client
  useEffect(() => {
    setOnAuthFailure(() => {
      setAccessToken(null)
      setUser(null)
      setCompany(null)
      queryClient.clear()
    })
  }, [])

  // Session Bootstrap on App Mount
  useEffect(() => {
    let isMounted = true

    async function bootstrapSession() {
      try {
        // Step 1: Silent refresh using HttpOnly cookie
        const refreshRes = await authApi.refreshApi()
        if (isMounted && refreshRes.accessToken) {
          handleAuthSuccess(refreshRes)
        }
      } catch {
        // No active session or cookie expired
        if (isMounted) {
          setAccessToken(null)
          setUser(null)
          setCompany(null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    bootstrapSession()

    return () => {
      isMounted = false
    }
  }, [setPrimaryColor])

  const login = async (data: LoginRequest) => {
    const res = await authApi.loginApi(data)
    handleAuthSuccess(res)
  }

  const register = async (data: RegisterRequest) => {
    const res = await authApi.registerApi(data)
    handleAuthSuccess(res)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        company,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
