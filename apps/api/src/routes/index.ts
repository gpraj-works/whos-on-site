import { Router } from 'express'
import { authRouter } from '../modules/auth/auth.routes'
import { technicianRouter } from '../modules/technicians/technician.routes'
import { customerRouter } from '../modules/customers/customer.routes'
import jobRouter from '../modules/jobs/job.routes'

const apiRouter: Router = Router()

apiRouter.use('/auth', authRouter)
apiRouter.use('/technicians', technicianRouter)
apiRouter.use('/customers', customerRouter)
apiRouter.use('/jobs', jobRouter)

export { apiRouter }
