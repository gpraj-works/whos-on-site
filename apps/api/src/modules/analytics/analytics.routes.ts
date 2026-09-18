import { Router } from 'express'
import { UserRole } from '@whosonsite/shared'
import { authenticate } from '../../middleware/authenticate'
import { companyContext } from '../../middleware/company'
import { authorize } from '../../middleware/authorize'
import * as analyticsController from './analytics.controller'

const router = Router()

// Protect all analytics endpoints with auth, company context, and role authorization
router.use(authenticate, companyContext)

router.get(
  '/summary',
  authorize([UserRole.OWNER, UserRole.ADMIN]),
  analyticsController.getAnalyticsSummary
)

export const analyticsRouter: Router = router
