import { Router } from 'express'
import { UserRole } from '@whosonsite/shared'
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

const router = Router()

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
  authorize(UserRole.OWNER, UserRole.ADMIN, UserRole.DISPATCHER, UserRole.AGENT),
  listJobsController
)

router.get(
  '/:id',
  authorize(UserRole.OWNER, UserRole.ADMIN, UserRole.DISPATCHER, UserRole.AGENT),
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

// Agent Assignments
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
  authorize(UserRole.OWNER, UserRole.ADMIN, UserRole.DISPATCHER, UserRole.AGENT),
  updateJobStatusController
)

router.get(
  '/:id/status-history',
  authorize(UserRole.OWNER, UserRole.ADMIN, UserRole.DISPATCHER, UserRole.AGENT),
  getJobHistoryController
)

export default router
