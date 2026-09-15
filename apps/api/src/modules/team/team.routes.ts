import { Router } from 'express'
import { UserRole } from '@whosonsite/shared'
import { authenticate } from '../../middleware/authenticate'
import { companyContext } from '../../middleware/company'
import { authorize } from '../../middleware/authorize'
import * as teamController from './team.controller'

const router = Router()

// Apply authentication and company context middleware across all team routes
router.use(authenticate, companyContext)

router.get(
  '/',
  authorize([UserRole.OWNER, UserRole.ADMIN, UserRole.DISPATCHER]),
  teamController.listTeamMembers
)

router.get(
  '/nearby',
  authorize([UserRole.OWNER, UserRole.ADMIN, UserRole.DISPATCHER]),
  teamController.nearbyTeamMembers
)

router.post('/', authorize([UserRole.OWNER, UserRole.ADMIN]), teamController.createTeamMember)

router.patch(
  '/:id/location',
  authorize([UserRole.TEAM_MEMBER, UserRole.OWNER, UserRole.ADMIN, UserRole.DISPATCHER]),
  teamController.updateLocation
)

export const teamRouter: Router = router
