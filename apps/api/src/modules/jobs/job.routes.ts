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

const router: Router = Router()

// All job endpoints require authentication & company context scope
router.use(authenticate, companyContext)

// Job CRUD & Listing
router.post('/', authorize(UserRole.OWNER, UserRole.ADMIN), createJobController)

router.get('/', authorize(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT), listJobsController)

router.get('/:id', authorize(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT), getJobByIdController)

router.patch('/:id', authorize(UserRole.OWNER, UserRole.ADMIN), updateJobController)

router.delete('/:id', authorize(UserRole.OWNER, UserRole.ADMIN), deleteJobController)

// Agent Assignments
router.post('/:id/assign', authorize(UserRole.OWNER, UserRole.ADMIN), assignJobController)

router.post('/:id/unassign', authorize(UserRole.OWNER, UserRole.ADMIN), unassignJobController)

// Status Transitions & Audit History
router.post(
  '/:id/status',
  authorize(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT),
  updateJobStatusController
)

router.get(
  '/:id/status-history',
  authorize(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT),
  getJobHistoryController
)

export default router
