import { NextFunction, Request, Response } from 'express'

export function companyContext(req: Request, res: Response, next: NextFunction): void {
  if (!req.auth || !req.auth.companyId) {
    res.status(401).json({ error: 'Company context missing. Authentication required.' })
    return
  }

  next()
}
