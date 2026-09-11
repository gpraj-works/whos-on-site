export class ApiError extends Error {
  public statusCode: number
  public code?: string
  public details?: unknown

  constructor(message: string, statusCode: number = 400, code?: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.code = code
    this.details = details
  }
}
