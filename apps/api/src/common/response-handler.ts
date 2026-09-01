import { Response } from 'express'
import { HttpStatus } from './http-status'

export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  data?: T
  error?: {
    message: string
    code?: string
    details?: unknown
  }
  timestamp: string
}

/**
 * Send a standardized API success response.
 */
export function sendSuccess<T = unknown>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: HttpStatus = HttpStatus.OK
): Response {
  const response: ApiResponse<T> = {
    success: true,
    timestamp: new Date().toISOString()
  }

  if (message) {
    response.message = message
  }

  if (data !== undefined) {
    response.data = data
  }

  return res.status(statusCode).json(response)
}

/**
 * Send a standardized API error response.
 */
export function sendError(
  res: Response,
  message: string,
  statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
  details?: unknown,
  code?: string
): Response {
  const response: ApiResponse = {
    success: false,
    error: {
      message,
      ...(code && { code }),
      ...(details !== undefined && { details })
    },
    timestamp: new Date().toISOString()
  }

  return res.status(statusCode).json(response)
}
