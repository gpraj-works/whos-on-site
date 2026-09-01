import { Router } from 'express'
import { authRouter } from '../modules/auth/auth.routes'
import { technicianRouter } from '../modules/technicians/technician.routes'

const apiRouter: Router = Router()

apiRouter.use('/auth', authRouter)
apiRouter.use('/technicians', technicianRouter)

export { apiRouter }
