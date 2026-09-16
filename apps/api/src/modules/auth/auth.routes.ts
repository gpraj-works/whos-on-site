import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import * as authController from './auth.controller'
import { authenticate } from '../../middleware/authenticate'

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit login/register attempts
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many login attempts. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED'
    }
  }
})

const generalAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // General auth sessions (refresh, logout, me)
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many authentication requests. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED'
    }
  }
})

const router = Router()

router.use(generalAuthLimiter)

router.post('/register', loginLimiter, authController.register)
router.post('/login', loginLimiter, authController.login)
router.post('/refresh', authController.refresh)
router.post('/logout', authController.logout)
router.get('/me', authenticate, authController.me)

export const authRouter: Router = router
