import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import * as authController from './auth.controller'
import { authenticate } from '../../middleware/authenticate'

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 auth requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please try again later.' }
})

const router: Router = Router()

router.use(authLimiter)

router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/refresh', authController.refresh)
router.post('/logout', authController.logout)
router.get('/me', authenticate, authController.me)

export const authRouter: Router = router
