import { AnalyticsSummaryDto } from '@whosonsite/shared'
import * as analyticsRepo from './analytics.repository'

/**
 * Service function fetching company-scoped analytics summary metrics
 */
export async function getCompanyAnalyticsSummary(companyId: string): Promise<AnalyticsSummaryDto> {
  return analyticsRepo.fetchAnalyticsSummary(companyId)
}
