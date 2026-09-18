import { Router } from 'express'
import { UserRole } from '@whosonsite/shared'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'
import { companyContext } from '../../middleware/company'
import {
  createCustomer,
  deleteCustomer,
  getCustomerById,
  listCustomers,
  updateCustomer
} from './customer.controller'

const router = Router()

// All customer endpoints require authentication & company context scope
router.use(authenticate, companyContext)

router.get('/', authorize(UserRole.OWNER, UserRole.ADMIN), listCustomers)

router.get('/:id', authorize(UserRole.OWNER, UserRole.ADMIN), getCustomerById)

router.post('/', authorize(UserRole.OWNER, UserRole.ADMIN), createCustomer)

router.patch('/:id', authorize(UserRole.OWNER, UserRole.ADMIN), updateCustomer)

router.delete('/:id', authorize(UserRole.OWNER, UserRole.ADMIN), deleteCustomer)

export const customerRouter: Router = router
