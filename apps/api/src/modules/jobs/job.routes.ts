import { Router } from 'express'
import { UserRole } from '@routeboard/shared'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'
import { companyContext } from '../../middleware/company'
import {
  assignJobController,
  createJobController,
  deleteJobController,
  getJobByIdController,
  getJobHistoryController,
  listJobsController,
  unassignJobController,
  updateJobController,
  updateJobStatusController
} from './job.controller'

const router: Router = Router()

// All job endpoints require authentication & company context scope
router.use(authenticate, companyContext)

// Job CRUD & Listing
router.post(
  '/',
  authorize(UserRole.OWNER, UserRole.ADMIN, UserRole.DISPATCHER),
  createJobController
)

router.get(
  '/',
  authorize(UserRole.OWNER, UserRole.ADMIN, UserRole.DISPATCHER, UserRole.TECHNICIAN),
  listJobsController
)

router.get(
  '/:id',
  authorize(UserRole.OWNER, UserRole.ADMIN, UserRole.DISPATCHER, UserRole.TECHNICIAN),
  getJobByIdController
)

router.patch(
  '/:id',
  authorize(UserRole.OWNER, UserRole.ADMIN, UserRole.DISPATCHER),
  updateJobController
)

router.delete(
  '/:id',
  authorize(UserRole.OWNER, UserRole.ADMIN, UserRole.DISPATCHER),
  deleteJobController
)

// Technician Assignments
router.post(
  '/:id/assign',
  authorize(UserRole.OWNER, UserRole.ADMIN, UserRole.DISPATCHER),
  assignJobController
)

router.post(
  '/:id/unassign',
  authorize(UserRole.OWNER, UserRole.ADMIN, UserRole.DISPATCHER),
  unassignJobController
)

// Status Transitions & Audit History
router.post(
  '/:id/status',
  authorize(UserRole.OWNER, UserRole.ADMIN, UserRole.DISPATCHER, UserRole.TECHNICIAN),
  updateJobStatusController
)

router.get(
  '/:id/status-history',
  authorize(UserRole.OWNER, UserRole.ADMIN, UserRole.DISPATCHER, UserRole.TECHNICIAN),
  getJobHistoryController
)

export default router
