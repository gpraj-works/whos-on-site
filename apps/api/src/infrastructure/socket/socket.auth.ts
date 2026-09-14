import { Socket } from 'socket.io'
import jwt from 'jsonwebtoken'
import { JwtPayload } from '@whosonsite/shared'
import { env } from '../../config/env'
import { logger } from '../logging/logger'

export interface AuthenticatedSocketData {
  userId: string
  companyId: string
  role: string
}

export function socketAuthMiddleware(socket: Socket, next: (err?: Error) => void): void {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '')

    if (!token) {
      logger.warn('Socket connection rejected: missing authentication token')
      return next(new Error('Authentication error: Token required'))
    }

    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload

    if (!payload || !payload.companyId || !payload.userId) {
      logger.warn('Socket connection rejected: invalid JWT payload')
      return next(new Error('Authentication error: Invalid token payload'))
    }

    socket.data.auth = {
      userId: payload.userId,
      companyId: payload.companyId,
      role: payload.role
    }

    next()
  } catch (err) {
    logger.warn({ err }, 'Socket connection rejected: token verification failed')
    next(new Error('Authentication error: Invalid or expired token'))
  }
}
