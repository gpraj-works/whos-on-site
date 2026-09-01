import { Request, RequestHandler, Response } from 'express'
import * as technicianService from './technician.service'
import {
  createTechnicianSchema,
  nearbyQuerySchema,
  updateLocationSchema
} from './technician.schema'
import { asyncHandler } from '../../middleware/error-handler'
import { sendSuccess } from '../../common/response-handler'
import { HttpStatus } from '../../common/http-status'

export const listTechnicians: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const companyId = req.auth!.companyId
  const technicians = await technicianService.getCompanyTechnicians(companyId)
  sendSuccess(res, technicians)
})

export const nearbyTechnicians: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const companyId = req.auth!.companyId
    const query = nearbyQuerySchema.parse(req.query)
    const results = await technicianService.getNearbyTechnicians({
      companyId,
      lat: query.lat,
      lng: query.lng,
      radiusMeters: query.radiusMeters
    })
    sendSuccess(res, results)
  }
)

export const createTechnician: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const companyId = req.auth!.companyId
    const userId = req.auth!.userId
    const parsed = createTechnicianSchema.parse(req.body)

    const technician = await technicianService.createTechnician({
      ...parsed,
      companyId,
      createdBy: userId
    })

    sendSuccess(res, technician, 'Technician created successfully.', HttpStatus.CREATED)
  }
)

export const updateLocation: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const companyId = req.auth!.companyId
  const technicianId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  const coords = updateLocationSchema.parse(req.body)

  const updated = await technicianService.updateTechnicianLocation(technicianId, companyId, coords)
  sendSuccess(res, updated, 'Technician location updated successfully.')
})
