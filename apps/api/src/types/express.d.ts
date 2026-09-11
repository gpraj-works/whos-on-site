import { UserRole } from '@whosonsite/shared'

export interface AuthenticatedContext {
  userId: string
  companyId: string
  role: UserRole
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthenticatedContext
    }
  }
}
