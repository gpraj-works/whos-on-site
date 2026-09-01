import { ErrorMessages } from './error-messages'
import { HttpStatus } from './http-status'

/** Base application error caught by global error middleware */
export class AppError extends Error {
  public readonly statusCode: HttpStatus
  public readonly code?: string
  public readonly details?: unknown

  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    code?: string,
    details?: unknown
  ) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    this.code = code
    this.details = details
    Error.captureStackTrace(this, this.constructor)
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = ErrorMessages.BAD_REQUEST, details?: unknown, code?: string) {
    super(message, HttpStatus.BAD_REQUEST, code, details)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = ErrorMessages.UNAUTHORIZED, details?: unknown, code?: string) {
    super(message, HttpStatus.UNAUTHORIZED, code, details)
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = ErrorMessages.FORBIDDEN, details?: unknown, code?: string) {
    super(message, HttpStatus.FORBIDDEN, code, details)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = ErrorMessages.NOT_FOUND, details?: unknown, code?: string) {
    super(message, HttpStatus.NOT_FOUND, code, details)
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: unknown, code?: string) {
    super(message, HttpStatus.CONFLICT, code, details)
  }
}

export class ValidationError extends AppError {
  constructor(message: string = ErrorMessages.VALIDATION_FAILED, details?: unknown, code?: string) {
    super(message, HttpStatus.UNPROCESSABLE_ENTITY, code, details)
  }
}
