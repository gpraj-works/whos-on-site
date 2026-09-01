import { NextFunction, Request, Response } from 'express'
import { UserRole } from '@routeboard/shared'
import { sendError } from '../common/response-handler'
import { HttpStatus } from '../common/http-status'
import { ErrorMessages } from '../common/error-messages'

/** Enforces user role permissions */
export function authorize(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.auth) {
      sendError(res, ErrorMessages.UNAUTHORIZED, HttpStatus.UNAUTHORIZED)
      return
    }

    if (!allowedRoles.includes(req.auth.role)) {
      sendError(res, ErrorMessages.FORBIDDEN, HttpStatus.FORBIDDEN, {
        requiredRoles: allowedRoles,
        userRole: req.auth.role
      })
      return
    }

    next()
  }
}
