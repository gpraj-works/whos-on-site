import React, { createContext, useCallback, useContext, useEffect, useRef } from 'react'
import {
  AuthUser,
  CompanyDto,
  LoginRequest,
  RegisterRequest,
  ThemeColorType
} from '@whosonsite/shared'
import { useAppTheme } from '../../app/theme/ThemeContext'
import { setOnAuthFailure } from '../../lib/api'
import { disconnectSocket, useSocketEvents } from '../../lib/socket'
import { useAppDispatch, useAppSelector } from '../../store'
import {
  bootstrapSessionThunk,
  clearCredentials,
  loginThunk,
  logoutThunk,
  registerThunk
} from '../../store/slices/authSlice'

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
  const dispatch = useAppDispatch()
  const { user, company, isAuthenticated, isLoading } = useAppSelector((state) => state.auth)
  const { setPrimaryColor } = useAppTheme()
  const hasBootstrappedRef = useRef<boolean>(false)

  // Update tenant primary color on company load if no user custom selection exists
  useEffect(() => {
    try {
      const savedColor = localStorage.getItem('whosonsite_primary_color')
      if (!savedColor && company?.primaryColor) {
        setPrimaryColor(company.primaryColor as ThemeColorType)
      }
    } catch {
      if (company?.primaryColor) {
        setPrimaryColor(company.primaryColor as ThemeColorType)
      }
    }
  }, [company?.primaryColor, setPrimaryColor])

  // Register auth failure callback with API client
  useEffect(() => {
    setOnAuthFailure(() => {
      dispatch(clearCredentials())
    })
  }, [dispatch])

  // Register real-time Socket.io event listeners when authenticated
  useSocketEvents(isAuthenticated)

  // Disconnect socket when session terminates or logs out
  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket()
    }
  }, [isAuthenticated])

  // Session Bootstrap on App Mount
  useEffect(() => {
    if (hasBootstrappedRef.current) {
      return
    }
    hasBootstrappedRef.current = true

    dispatch(bootstrapSessionThunk())
  }, [dispatch])

  const login = useCallback(
    async (data: LoginRequest) => {
      const resultAction = await dispatch(loginThunk(data))
      if (loginThunk.rejected.match(resultAction)) {
        throw new Error((resultAction.payload as string) || 'Login failed')
      }
    },
    [dispatch]
  )

  const register = useCallback(
    async (data: RegisterRequest) => {
      const resultAction = await dispatch(registerThunk(data))
      if (registerThunk.rejected.match(resultAction)) {
        throw new Error((resultAction.payload as string) || 'Registration failed')
      }
    },
    [dispatch]
  )

  const logout = useCallback(async () => {
    await dispatch(logoutThunk())
  }, [dispatch])

  return (
    <AuthContext.Provider
      value={{
        user,
        company,
        isAuthenticated,
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
