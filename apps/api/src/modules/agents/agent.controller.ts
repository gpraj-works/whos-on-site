import { Request, RequestHandler, Response } from 'express'
import * as agentService from './agent.service'
import {
  createAgentSchema,
  nearbyQuerySchema,
  updateLocationSchema,
  updateAgentSchema
} from './agent.schema'
import { asyncHandler } from '../../middleware/error-handler'
import { sendSuccess } from '../../common/response-handler'
import { HttpStatus } from '../../common/http-status'

export const listAgents: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const companyId = req.auth!.companyId
  const agents = await agentService.getCompanyAgents(companyId)
  sendSuccess(res, agents)
})

export const nearbyAgents: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const companyId = req.auth!.companyId
  const query = nearbyQuerySchema.parse(req.query)
  const results = await agentService.getNearbyAgents({
    companyId,
    lat: query.lat,
    lng: query.lng,
    radiusMeters: query.radiusMeters
  })
  sendSuccess(res, results)
})

export const createAgent: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const companyId = req.auth!.companyId
  const userId = req.auth!.userId
  const parsed = createAgentSchema.parse(req.body)

  const agent = await agentService.createAgent({
    ...parsed,
    companyId,
    createdBy: userId
  })

  sendSuccess(res, agent, 'Agent created successfully.', HttpStatus.CREATED)
})

export const updateLocation: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const companyId = req.auth!.companyId
  const agentId = req.params.id as string
  const coords = updateLocationSchema.parse(req.body)

  const updated = await agentService.updateAgentLocation(agentId, companyId, coords)
  sendSuccess(res, updated, 'Agent location updated successfully.')
})

export const updateAgent: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const companyId = req.auth!.companyId
  const agentId = req.params.id as string
  const parsed = updateAgentSchema.parse(req.body)

  const updated = await agentService.updateAgent(agentId, companyId, parsed)
  sendSuccess(res, updated, 'Agent updated successfully.')
})

export const deleteAgent: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const companyId = req.auth!.companyId
  const agentId = req.params.id as string

  await agentService.deleteAgent(agentId, companyId)
  sendSuccess(res, null, 'Agent deleted successfully.', HttpStatus.OK)
})
