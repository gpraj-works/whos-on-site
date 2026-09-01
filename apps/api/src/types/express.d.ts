import { UserRole } from '@routeboard/shared'

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
