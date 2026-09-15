import { RequestHandler } from 'express'
import { UnauthorizedError } from '../../common/app-error'
import { HttpStatus } from '../../common/http-status'
import { sendSuccess } from '../../common/response-handler'
import { asyncHandler } from '../../middleware/error-handler'
import * as assignmentService from './job-assignment.service'
import {
  assignJobSchema,
  createJobSchema,
  jobFilterQuerySchema,
  updateJobSchema,
  updateJobStatusSchema
} from './job.schema'
import * as jobService from './job.service'

/** Create job endpoint handler */
export const createJobController: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.auth) throw new UnauthorizedError()
  const companyId = req.auth.companyId
  const userId = req.auth.userId
  const input = createJobSchema.parse(req.body)

  const job = await jobService.createNewJob(input, companyId, userId)
  return sendSuccess(res, job, 'Job created successfully', HttpStatus.CREATED)
})

/** List company jobs endpoint handler */
export const listJobsController: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.auth) throw new UnauthorizedError()
  const companyId = req.auth.companyId
  const userId = req.auth.userId
  const role = req.auth.role
  const query = jobFilterQuerySchema.parse(req.query)

  const jobs = await jobService.listCompanyJobs(query, companyId, role, userId)
  return sendSuccess(res, jobs, 'Jobs retrieved successfully', HttpStatus.OK)
})

/** Get job detail endpoint handler */
export const getJobByIdController: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.auth) throw new UnauthorizedError()
  const companyId = req.auth.companyId
  const userId = req.auth.userId
  const role = req.auth.role
  const id = req.params.id as string

  const job = await jobService.getJobDetail(id, companyId, role, userId)
  return sendSuccess(res, job, 'Job retrieved successfully', HttpStatus.OK)
})

/** Update job endpoint handler */
export const updateJobController: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.auth) throw new UnauthorizedError()
  const companyId = req.auth.companyId
  const userId = req.auth.userId
  const id = req.params.id as string
  const input = updateJobSchema.parse(req.body)

  const updated = await jobService.updateJobDetails(id, companyId, input, userId)
  return sendSuccess(res, updated, 'Job updated successfully', HttpStatus.OK)
})

/** Cancel/Delete job endpoint handler */
export const deleteJobController: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.auth) throw new UnauthorizedError()
  const companyId = req.auth.companyId
  const userId = req.auth.userId
  const id = req.params.id as string

  const cancelled = await jobService.cancelJob(id, companyId, userId, 'Job cancelled via API')
  return sendSuccess(res, cancelled, 'Job cancelled successfully', HttpStatus.OK)
})

/** Assign teamMember endpoint handler */
export const assignJobController: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.auth) throw new UnauthorizedError()
  const companyId = req.auth.companyId
  const userId = req.auth.userId
  const id = req.params.id as string
  const { teamMemberId } = assignJobSchema.parse(req.body)

  const assigned = await assignmentService.assignTeamMemberToJob(
    id,
    teamMemberId,
    companyId,
    userId
  )
  return sendSuccess(res, assigned, 'TeamMember assigned successfully', HttpStatus.OK)
})

/** Unassign teamMember endpoint handler */
export const unassignJobController: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.auth) throw new UnauthorizedError()
  const companyId = req.auth.companyId
  const userId = req.auth.userId
  const id = req.params.id as string

  const unassigned = await assignmentService.unassignTeamMemberFromJob(id, companyId, userId)
  return sendSuccess(res, unassigned, 'TeamMember unassigned successfully', HttpStatus.OK)
})

/** Change job status endpoint handler */
export const updateJobStatusController: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.auth) throw new UnauthorizedError()
  const companyId = req.auth.companyId
  const userId = req.auth.userId
  const role = req.auth.role
  const id = req.params.id as string
  const { status, note } = updateJobStatusSchema.parse(req.body)

  const updated = await jobService.changeJobStatus(id, status, companyId, userId, role, note)
  return sendSuccess(res, updated, 'Job status updated successfully', HttpStatus.OK)
})

/** Get job status history endpoint handler */
export const getJobHistoryController: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.auth) throw new UnauthorizedError()
  const companyId = req.auth.companyId
  const id = req.params.id as string

  const history = await jobService.getJobStatusHistoryTrail(id, companyId)
  return sendSuccess(res, history, 'Job history retrieved successfully', HttpStatus.OK)
})
