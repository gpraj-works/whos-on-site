import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { JwtPayload } from '@routeboard/shared'
import { env } from '../config/env'
import { sendError } from '../common/response-handler'
import { HttpStatus } from '../common/http-status'
import { ErrorMessages } from '../common/error-messages'

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, ErrorMessages.UNAUTHORIZED, HttpStatus.UNAUTHORIZED)
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload

    req.auth = {
      userId: payload.userId,
      companyId: payload.companyId,
      role: payload.role
    }

    next()
  } catch (err) {
    sendError(
      res,
      ErrorMessages.INVALID_TOKEN,
      HttpStatus.UNAUTHORIZED,
      err instanceof Error ? err.message : undefined
    )
  }
}
