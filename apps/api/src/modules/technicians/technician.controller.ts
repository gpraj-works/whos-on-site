import { Request, Response } from 'express'
import * as technicianService from './technician.service'
import {
  createTechnicianSchema,
  nearbyQuerySchema,
  updateLocationSchema
} from './technician.schema'

export async function listTechnicians(req: Request, res: Response): Promise<void> {
  try {
    const companyId = req.auth!.companyId
    const technicians = await technicianService.getCompanyTechnicians(companyId)
    res.json(technicians)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve technicians.'
    res.status(500).json({ error: message })
  }
}

export async function nearbyTechnicians(req: Request, res: Response): Promise<void> {
  try {
    const companyId = req.auth!.companyId
    const query = nearbyQuerySchema.parse(req.query)
    const results = await technicianService.getNearbyTechnicians({
      companyId,
      lat: query.lat,
      lng: query.lng,
      radiusMeters: query.radiusMeters
    })
    res.json(results)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to query nearby technicians.'
    res.status(400).json({ error: message })
  }
}

export async function createTechnician(req: Request, res: Response): Promise<void> {
  try {
    const companyId = req.auth!.companyId
    const userId = req.auth!.userId
    const parsed = createTechnicianSchema.parse(req.body)

    const technician = await technicianService.createTechnician({
      ...parsed,
      companyId,
      createdBy: userId
    })

    res.status(201).json(technician)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create technician.'
    res.status(400).json({ error: message })
  }
}

export async function updateLocation(req: Request, res: Response): Promise<void> {
  try {
    const companyId = req.auth!.companyId
    const technicianId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const coords = updateLocationSchema.parse(req.body)

    const updated = await technicianService.updateTechnicianLocation(
      technicianId,
      companyId,
      coords
    )
    res.json(updated)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update location.'
    res.status(400).json({ error: message })
  }
}
