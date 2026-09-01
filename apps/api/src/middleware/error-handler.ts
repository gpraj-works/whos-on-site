import { NextFunction, Request, RequestHandler, Response } from 'express'
import { ZodError } from 'zod'
import { AppError } from '../common/app-error'
import { ErrorMessages } from '../common/error-messages'
import { HttpStatus } from '../common/http-status'
import { sendError } from '../common/response-handler'
import { logger } from '../infrastructure/logging/logger'

/** Wraps async controller handlers to pass errors to Express error handler */
export function asyncHandler(fn: RequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

/** Global Express error handling middleware */
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  // Handle custom AppErrors
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode, err.details, err.code)
    return
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const formattedDetails = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message
    }))
    sendError(
      res,
      ErrorMessages.VALIDATION_FAILED,
      HttpStatus.BAD_REQUEST,
      formattedDetails,
      'VALIDATION_ERROR'
    )
    return
  }

  // Log unexpected errors
  logger.error({ err }, 'Unhandled runtime error caught by error handler')

  // Fallback 500 error
  sendError(
    res,
    err.message || ErrorMessages.INTERNAL_SERVER_ERROR,
    HttpStatus.INTERNAL_SERVER_ERROR
  )
}
