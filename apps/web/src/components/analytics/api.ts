import { AnalyticsSummaryDto } from '@whosonsite/shared'
import { apiClient } from '../../lib/api'

export async function fetchAnalyticsSummary(): Promise<AnalyticsSummaryDto> {
  return apiClient<AnalyticsSummaryDto>('/analytics/summary')
}
