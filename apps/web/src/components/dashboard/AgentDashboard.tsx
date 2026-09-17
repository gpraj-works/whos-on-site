import React from 'react'
import { Grid, Stack } from '@mantine/core'
import { JobStatus } from '@whosonsite/shared'
import { CalendarClock, CalendarDays, TrendingUp } from 'lucide-react'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import { useAppTheme } from '../../app/theme/ThemeContext'
import { useJobs } from '../jobs/queries'
import { formatTime } from '../../lib/date/format'
import { ApiErrorAlert } from '../feedback/ApiErrorAlert'
import { StatCard } from './StatCard'
import { DashboardTable } from './DashboardTable'

export const AgentDashboard: React.FC = () => {
  const { t } = useTranslation()
  const { primaryColor } = useAppTheme()

  const today = dayjs().format('YYYY-MM-DD')

  const {
    data: allJobs = [],
    error: allError
  } = useJobs({ limit: 100 })
  const {
    data: todayJobs = [],
    isLoading: isLoadingToday,
    error: todayError
  } = useJobs({ date: today, limit: 100 })

  const totalAssigned = allJobs.length
  const completedCount = allJobs.filter((j) => j.status === JobStatus.COMPLETE).length
  const completionPct = totalAssigned > 0 ? Math.round((completedCount / totalAssigned) * 100) : 0

  const activeToday = todayJobs.filter(
    (j) => j.status !== JobStatus.COMPLETE && j.status !== JobStatus.CANCELLED
  ).length

  const now = Date.now()
  const nextAppointment =
    allJobs
      .filter(
        (j) =>
          j.status !== JobStatus.COMPLETE &&
          j.status !== JobStatus.CANCELLED &&
          j.scheduledAt &&
          new Date(j.scheduledAt).getTime() >= now
      )
      .sort(
        (a, b) =>
          new Date(a.scheduledAt as string).getTime() - new Date(b.scheduledAt as string).getTime()
      )[0] ?? null

  return (
    <Stack gap="xs">
      <ApiErrorAlert error={allError || todayError} />

      <Grid gutter="sm">
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <StatCard
            title={t('dashboard.myJobsToday', 'My Jobs Today')}
            value={String(todayJobs.length)}
            icon={CalendarDays}
            color={primaryColor}
            description={t('dashboard.myJobsTodayDesc', '{{count}} active today', {
              count: activeToday
            })}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <StatCard
            title={t('dashboard.nextAppointment', 'Next Appointment')}
            value={nextAppointment ? formatTime(nextAppointment.scheduledAt) : '—'}
            icon={CalendarClock}
            color="blue"
            description={
              nextAppointment
                ? (nextAppointment.customer?.name || t('jobs.noCustomer', 'Assigned Customer'))
                : t('dashboard.noneScheduled', 'No upcoming appointments')
            }
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <StatCard
            title={t('dashboard.completionRate', 'Completion Rate')}
            value={`${completionPct}%`}
            icon={TrendingUp}
            color="green"
            description={`${completedCount} ${t('dashboard.completedOf', 'of')} ${totalAssigned} ${t(
              'dashboard.jobsCompleted',
              'jobs completed'
            )}`}
          />
        </Grid.Col>
      </Grid>

      <DashboardTable
        title={t('dashboard.todaySchedule', "Today's Schedule")}
        subtitle={t('dashboard.todayScheduleSubtitle', 'Assigned jobs scheduled for today')}
        jobs={todayJobs}
        columns={['customer', 'status', 'scheduledAt']}
        loading={isLoadingToday}
        emptyMessage={t('dashboard.noTodayJobs', 'No jobs scheduled for today.')}
        viewAllTo="/my-jobs"
        viewAllLabel={t('dashboard.viewAllJobs', 'View All Jobs')}
      />
    </Stack>
  )
}