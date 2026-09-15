import { and, count, eq, gte, sql } from 'drizzle-orm'
import { AnalyticsSummaryDto, DailyJobCount, JobStatus, AgentStatus } from '@whosonsite/shared'
import { db } from '../../infrastructure/database/client'
import { jobs, agents } from '../../infrastructure/database/schema'

export async function fetchAnalyticsSummary(companyId: string): Promise<AnalyticsSummaryDto> {
  // 1. Fetch Jobs by Status
  const jobStatusCounts = await db
    .select({
      status: jobs.status,
      count: count()
    })
    .from(jobs)
    .where(eq(jobs.companyId, companyId))
    .groupBy(jobs.status)

  const jobsByStatus: Record<JobStatus, number> = {
    [JobStatus.UNASSIGNED]: 0,
    [JobStatus.ASSIGNED]: 0,
    [JobStatus.EN_ROUTE]: 0,
    [JobStatus.ON_SITE]: 0,
    [JobStatus.COMPLETE]: 0,
    [JobStatus.CANCELLED]: 0
  }

  let totalJobsCount = 0
  for (const row of jobStatusCounts) {
    const statusKey = row.status as JobStatus
    if (statusKey in jobsByStatus) {
      jobsByStatus[statusKey] = Number(row.count)
    }
    totalJobsCount += Number(row.count)
  }

  // 2. Fetch Jobs Created in the Last 14 Days
  const fourteenDaysAgo = new Date()
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13)
  fourteenDaysAgo.setHours(0, 0, 0, 0)

  const rawDailyCounts = await db
    .select({
      dateStr: sql<string>`TO_CHAR(${jobs.createdAt}, 'YYYY-MM-DD')`,
      count: count()
    })
    .from(jobs)
    .where(and(eq(jobs.companyId, companyId), gte(jobs.createdAt, fourteenDaysAgo)))
    .groupBy(sql`TO_CHAR(${jobs.createdAt}, 'YYYY-MM-DD')`)

  const dailyCountMap = new Map<string, number>()
  for (const row of rawDailyCounts) {
    dailyCountMap.set(row.dateStr, Number(row.count))
  }

  const jobsCreatedLast14Days: DailyJobCount[] = []
  const curr = new Date(fourteenDaysAgo)
  const today = new Date()
  today.setHours(23, 59, 59, 999)

  while (curr <= today) {
    const isoDate = curr.toISOString().split('T')[0]
    jobsCreatedLast14Days.push({
      date: isoDate,
      count: dailyCountMap.get(isoDate) || 0
    })
    curr.setDate(curr.getDate() + 1)
  }

  // 3. Fetch Agent Availability Counts
  const techStatusCounts = await db
    .select({
      status: agents.status,
      count: count()
    })
    .from(agents)
    .where(eq(agents.companyId, companyId))
    .groupBy(agents.status)

  const agentAvailability: Record<AgentStatus, number> = {
    [AgentStatus.AVAILABLE]: 0,
    [AgentStatus.BUSY]: 0,
    [AgentStatus.OFFLINE]: 0
  }

  let totalAgentsCount = 0
  for (const row of techStatusCounts) {
    const statusKey = row.status as AgentStatus
    if (statusKey in agentAvailability) {
      agentAvailability[statusKey] = Number(row.count)
    }
    totalAgentsCount += Number(row.count)
  }

  // 4. Calculate Average Completion Time (in minutes)
  const completedDurationResult = await db
    .select({
      avgMinutes: sql<number>`COALESCE(AVG(EXTRACT(EPOCH FROM (${jobs.updatedAt} - ${jobs.createdAt})) / 60), 0)`
    })
    .from(jobs)
    .where(and(eq(jobs.companyId, companyId), eq(jobs.status, JobStatus.COMPLETE)))

  const avgCompletionTimeMinutes = Math.round(Number(completedDurationResult[0]?.avgMinutes || 0))

  return {
    jobsByStatus,
    jobsCreatedLast14Days,
    agentAvailability,
    avgCompletionTimeMinutes,
    totalJobsCount,
    totalAgentsCount
  }
}
