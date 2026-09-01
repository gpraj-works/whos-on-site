import { NextFunction, Request, Response } from 'express'
import { UserRole } from '@routeboard/shared'

export function authorize(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.auth) {
      res.status(401).json({ error: 'Authentication context required.' })
      return
    }

    if (!allowedRoles.includes(req.auth.role)) {
      res.status(403).json({
        error: 'Forbidden. Insufficient permissions for this action.',
        requiredRoles: allowedRoles,
        userRole: req.auth.role
      })
      return
    }

    next()
  }
}
