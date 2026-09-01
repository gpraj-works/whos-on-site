import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { JwtPayload } from '@routeboard/shared'
import { env } from '../config/env'

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Missing Bearer token.' })
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
    res.status(401).json({
      error: 'Invalid or expired access token.',
      details: err instanceof Error ? err.message : undefined
    })
  }
}
