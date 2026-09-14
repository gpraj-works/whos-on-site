import { Router } from 'express'
import { analyticsRouter } from '../modules/analytics/analytics.routes'
import { authRouter } from '../modules/auth/auth.routes'
import { customerRouter } from '../modules/customers/customer.routes'
import jobRouter from '../modules/jobs/job.routes'
import { technicianRouter } from '../modules/technicians/technician.routes'

const apiRouter: Router = Router()

apiRouter.use('/auth', authRouter)
apiRouter.use('/technicians', technicianRouter)
apiRouter.use('/customers', customerRouter)
apiRouter.use('/jobs', jobRouter)
apiRouter.use('/analytics', analyticsRouter)


export { apiRouter }
