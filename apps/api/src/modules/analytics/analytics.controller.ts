import { Request, RequestHandler, Response } from 'express'
import * as analyticsService from './analytics.service'
import { asyncHandler } from '../../middleware/error-handler'
import { sendSuccess } from '../../common/response-handler'

/**
 * Controller for GET /api/analytics/summary
 */
export const getAnalyticsSummary: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const companyId = req.auth!.companyId
    const summary = await analyticsService.getCompanyAnalyticsSummary(companyId)
    sendSuccess(res, summary)
  }
)
