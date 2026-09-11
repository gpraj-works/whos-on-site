import { ApiError } from './errors'

export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  data?: T
  error?: {
    message: string
    code?: string
    details?: unknown
  }
  timestamp?: string
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

let memoryAccessToken: string | null = null

export function setAccessToken(token: string | null) {
  memoryAccessToken = token
}

export function getAccessToken(): string | null {
  return memoryAccessToken
}

// Single-flight refresh queue state
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (err: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error)
    } else if (token) {
      promise.resolve(token)
    }
  })
  failedQueue = []
}

// Callback registered by AuthContext to notify when refresh fails completely
let onAuthFailureCallback: (() => void) | null = null

export function setOnAuthFailure(callback: () => void) {
  onAuthFailureCallback = callback
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean
}

/** Core HTTP Client wrapper around fetch with 401 single-flight auto-refresh queue */
export async function apiClient<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { skipAuth = false, headers: customHeaders, ...restOptions } = options

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>)
  }

  if (!skipAuth && memoryAccessToken) {
    headers['Authorization'] = `Bearer ${memoryAccessToken}`
  }

  const response = await fetch(url, {
    ...restOptions,
    headers,
    credentials: 'include' // Sends HttpOnly cookies
  })

  // Handle 401 Unauthorized
  if (
    response.status === 401 &&
    !skipAuth &&
    !endpoint.includes('/auth/refresh') &&
    !endpoint.includes('/auth/login')
  ) {
    if (isRefreshing) {
      // Queue pending request while single-flight refresh completes
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((newToken) => {
          return apiClient<T>(endpoint, {
            ...options,
            headers: {
              ...customHeaders,
              Authorization: `Bearer ${newToken}`
            }
          })
        })
        .catch((err) => {
          throw err
        })
    }

    isRefreshing = true

    try {
      // Attempt silent refresh via HttpOnly cookie
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      })

      const refreshJson: ApiResponse<{ accessToken: string }> = await refreshRes.json()

      if (!refreshRes.ok || !refreshJson.success || !refreshJson.data?.accessToken) {
        throw new ApiError('Session expired. Please log in again.', 401)
      }

      const newAccessToken = refreshJson.data.accessToken
      setAccessToken(newAccessToken)
      isRefreshing = false
      processQueue(null, newAccessToken)

      // Retry original failed request with new access token
      return apiClient<T>(endpoint, {
        ...options,
        headers: {
          ...customHeaders,
          Authorization: `Bearer ${newAccessToken}`
        }
      })
    } catch (refreshErr) {
      isRefreshing = false
      setAccessToken(null)
      processQueue(refreshErr, null)
      if (onAuthFailureCallback) {
        onAuthFailureCallback()
      }
      throw refreshErr instanceof ApiError
        ? refreshErr
        : new ApiError('Session expired. Please log in again.', 401)
    }
  }

  let json: ApiResponse<T>
  try {
    json = await response.json()
  } catch {
    throw new ApiError('Failed to parse server response.', response.status)
  }

  if (!response.ok || !json.success) {
    const rawError = json.error as
      { message?: string; code?: string; details?: unknown } | string | undefined
    const errorMessage =
      (typeof rawError === 'string' ? rawError : rawError?.message) ||
      json.message ||
      'An error occurred during request execution.'

    throw new ApiError(
      errorMessage,
      response.status,
      typeof rawError === 'object' && rawError !== null ? rawError.code : undefined,
      typeof rawError === 'object' && rawError !== null ? rawError.details : undefined
    )
  }

  return json.data as T
}
