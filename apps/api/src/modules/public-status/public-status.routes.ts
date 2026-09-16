import { Router } from 'express'
import { getPublicJobStatusController } from './public-status.controller'

const publicStatusRouter: Router = Router()

publicStatusRouter.get('/jobs/:token', getPublicJobStatusController)

export { publicStatusRouter }
