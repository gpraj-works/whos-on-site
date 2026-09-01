import { Router } from 'express'
import { UserRole } from '@routeboard/shared'
import { authenticate } from '../../middleware/authenticate'
import { companyContext } from '../../middleware/company'
import { authorize } from '../../middleware/authorize'
import * as technicianController from './technician.controller'

const router = Router()

// Apply authentication and company context middleware across all technician routes
router.use(authenticate, companyContext)

router.get(
  '/',
  authorize([UserRole.OWNER, UserRole.ADMIN, UserRole.DISPATCHER]),
  technicianController.listTechnicians
)

router.get(
  '/nearby',
  authorize([UserRole.OWNER, UserRole.ADMIN, UserRole.DISPATCHER]),
  technicianController.nearbyTechnicians
)

router.post('/', authorize([UserRole.OWNER, UserRole.ADMIN]), technicianController.createTechnician)

router.patch(
  '/:id/location',
  authorize([UserRole.TECHNICIAN, UserRole.OWNER, UserRole.ADMIN, UserRole.DISPATCHER]),
  technicianController.updateLocation
)

export const technicianRouter: Router = router
