import { Router } from 'express'
import { UserRole } from '@whosonsite/shared'
import { authenticate } from '../../middleware/authenticate'
import { companyContext } from '../../middleware/company'
import { authorize } from '../../middleware/authorize'
import * as agentController from './agent.controller'

const router = Router()

// Apply authentication and company context middleware across all agent routes
router.use(authenticate, companyContext)

router.get(
  '/',
  authorize([UserRole.OWNER, UserRole.ADMIN, UserRole.DISPATCHER]),
  agentController.listAgents
)

router.get(
  '/nearby',
  authorize([UserRole.OWNER, UserRole.ADMIN, UserRole.DISPATCHER]),
  agentController.nearbyAgents
)

router.post('/', authorize([UserRole.OWNER, UserRole.ADMIN]), agentController.createAgent)

router.patch(
  '/:id/location',
  authorize([UserRole.AGENT, UserRole.OWNER, UserRole.ADMIN, UserRole.DISPATCHER]),
  agentController.updateLocation
)

router.patch(
  '/:id',
  authorize([UserRole.OWNER, UserRole.ADMIN, UserRole.DISPATCHER]),
  agentController.updateAgent
)

export const agentRouter: Router = router
