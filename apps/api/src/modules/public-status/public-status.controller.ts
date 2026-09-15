import { RequestHandler } from 'express'
import { HttpStatus } from '../../common/http-status'
import { sendSuccess } from '../../common/response-handler'
import { asyncHandler } from '../../middleware/error-handler'
import { getPublicJobStatus } from './public-status.service'

export const getPublicJobStatusController: RequestHandler = asyncHandler(async (req, res) => {
  const token = req.params.token as string
  const status = await getPublicJobStatus(token)
  return sendSuccess(res, status, 'Public job status retrieved successfully', HttpStatus.OK)
})
