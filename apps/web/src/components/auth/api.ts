import {
  AuthResponse,
  AuthUser,
  CompanyDto,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest
} from '@whosonsite/shared'
import { apiClient } from '../../lib/api'

export type MeResponse = { user: AuthUser; company?: CompanyDto }

export async function loginApi(data: LoginRequest) {
  return apiClient<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
    skipAuth: true
  })
}

export async function registerApi(data: RegisterRequest) {
  return apiClient<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
    skipAuth: true
  })
}

export async function forgotPasswordApi(data: ForgotPasswordRequest) {
  return apiClient<{ message: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(data),
    skipAuth: true
  })
}

export async function resetPasswordApi(data: ResetPasswordRequest) {
  return apiClient<{ message: string }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(data),
    skipAuth: true
  })
}

export async function meApi() {
  return apiClient<MeResponse>('/auth/me')
}

export async function logoutApi() {
  return apiClient<void>('/auth/logout', {
    method: 'POST'
  })
}

let inFlightRefreshPromise: Promise<AuthResponse> | null = null

export async function refreshApi() {
  if (inFlightRefreshPromise) {
    return inFlightRefreshPromise
  }

  inFlightRefreshPromise = apiClient<AuthResponse>('/auth/refresh', {
    method: 'POST',
    skipAuth: true
  }).finally(() => {
    inFlightRefreshPromise = null
  })

  return inFlightRefreshPromise
}
