import { Request, RequestHandler, Response } from 'express'
import * as teamMemberService from './team.service'
import {
  createTeamMemberSchema,
  nearbyQuerySchema,
  updateLocationSchema
} from './team.schema'
import { asyncHandler } from '../../middleware/error-handler'
import { sendSuccess } from '../../common/response-handler'
import { HttpStatus } from '../../common/http-status'

export const listTeamMembers: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const companyId = req.auth!.companyId
  const teamMembers = await teamMemberService.getCompanyTeamMembers(companyId)
  sendSuccess(res, teamMembers)
})

export const nearbyTeamMembers: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const companyId = req.auth!.companyId
    const query = nearbyQuerySchema.parse(req.query)
    const results = await teamMemberService.getNearbyTeamMembers({
      companyId,
      lat: query.lat,
      lng: query.lng,
      radiusMeters: query.radiusMeters
    })
    sendSuccess(res, results)
  }
)

export const createTeamMember: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const companyId = req.auth!.companyId
    const userId = req.auth!.userId
    const parsed = createTeamMemberSchema.parse(req.body)

    const teamMember = await teamMemberService.createTeamMember({
      ...parsed,
      companyId,
      createdBy: userId
    })

    sendSuccess(res, teamMember, 'TeamMember created successfully.', HttpStatus.CREATED)
  }
)

export const updateLocation: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const companyId = req.auth!.companyId
  const teamMemberId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  const coords = updateLocationSchema.parse(req.body)

  const updated = await teamMemberService.updateTeamMemberLocation(teamMemberId, companyId, coords)
  sendSuccess(res, updated, 'TeamMember location updated successfully.')
})
