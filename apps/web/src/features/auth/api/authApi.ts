import {
  AuthResponse,
  AuthUser,
  CompanyDto,
  LoginRequest,
  RegisterRequest
} from '@whosonsite/shared'
import { apiClient } from '../../../lib/api'

export async function loginApi(data: LoginRequest): Promise<AuthResponse> {
  return apiClient<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
    skipAuth: true
  })
}

export async function registerApi(data: RegisterRequest): Promise<AuthResponse> {
  return apiClient<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
    skipAuth: true
  })
}

export async function logoutApi(): Promise<void> {
  return apiClient<void>('/auth/logout', {
    method: 'POST'
  })
}

let inFlightRefreshPromise: Promise<AuthResponse> | null = null

export async function refreshApi(): Promise<AuthResponse> {
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

export async function getMeApi(): Promise<{ user: AuthUser; company?: CompanyDto }> {
  return apiClient<{ user: AuthUser; company?: CompanyDto }>('/auth/me')
}
