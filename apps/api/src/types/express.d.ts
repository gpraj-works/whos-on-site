import { UserRole } from '@whosonsite/shared'

interface AuthenticatedContext {
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
