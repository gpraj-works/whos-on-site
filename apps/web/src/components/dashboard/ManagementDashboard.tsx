import React from 'react'
import {
  Avatar,
  Badge,
  Button,
  Card,
  Grid,
  Group,
  Paper,
  RingProgress,
  Stack,
  Text,
  Title
} from '@mantine/core'
import { AgentStatus, JobStatus } from '@whosonsite/shared'
import {
  Briefcase,
  CheckCircle2,
  ClipboardList,
  Inbox,
  MapPin,
  Navigation,
  Truck,
  Users
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { useAppTheme } from '../../app/theme/ThemeContext'
import { useAgents } from '../agents/queries'
import { ApiErrorAlert } from '../feedback/ApiErrorAlert'
import { useJobs } from '../jobs/queries'
import { StatCard } from './StatCard'
import { DashboardTable } from './DashboardTable'

export const ManagementDashboard: React.FC = () => {
  const { t } = useTranslation()
  const { primaryColor } = useAppTheme()

  const {
    data: jobs = [],
    isLoading: isLoadingJobs,
    error: jobsError
  } = useJobs()
  const {
    data: agents = [],
    isLoading: isLoadingTechs,
    error: techsError
  } = useAgents()

  const activeJobs = jobs.filter(
    (j) => j.status !== JobStatus.COMPLETE && j.status !== JobStatus.CANCELLED
  )
  const unassignedCount = jobs.filter((j) => j.status === JobStatus.UNASSIGNED).length
  const assignedCount = jobs.filter((j) => j.status === JobStatus.ASSIGNED).length
  const enRouteCount = jobs.filter((j) => j.status === JobStatus.EN_ROUTE).length
  const onSiteCount = jobs.filter((j) => j.status === JobStatus.ON_SITE).length

  const onlineTechs = agents.filter((a) => a.status !== AgentStatus.OFFLINE)
  const availableTechs = agents.filter((a) => a.status === AgentStatus.AVAILABLE)
  const busyTechs = agents.filter((a) => a.status === AgentStatus.BUSY)

  const completedToday = jobs.filter((j) => j.status === JobStatus.COMPLETE).length
  const completionPct =
    jobs.length > 0 ? Math.round((completedToday / jobs.length) * 100) : 0

  const recentJobs = jobs.slice(0, 5)

  return (
    <Stack gap="xs">
      <ApiErrorAlert error={jobsError || techsError} />

      <Grid gutter="sm">
        {[
          {
            title: t('dashboard.activeJobs', 'Active Jobs'),
            value: String(activeJobs.length),
            icon: Truck,
            color: primaryColor,
            description: `${enRouteCount} ${t('dashboard.enRouteField', 'en route')}, ${onSiteCount} ${t(
              'dashboard.onSiteField',
              'on site'
            )}, ${unassignedCount} ${t('dashboard.unassignedField', 'unassigned')}`
          },
          {
            title: t('dashboard.agentsOnline', 'Agents Online'),
            value: `${onlineTechs.length} / ${agents.length}`,
            icon: Users,
            color: 'blue',
            description: `${availableTechs.length} ${t('dashboard.availableField', 'available')}, ${busyTechs.length} ${t(
              'dashboard.busyField',
              'busy'
            )}`
          },
          {
            title: t('dashboard.completedToday', 'Completed Jobs'),
            value: String(completedToday),
            icon: CheckCircle2,
            color: 'green',
            description: `${jobs.length} ${t('dashboard.totalJobsField', 'total jobs recorded')}`
          },
          {
            title: t('dashboard.unassignedJobs', 'Unassigned Jobs'),
            value: String(unassignedCount),
            icon: Inbox,
            color: 'orange',
            description: t('dashboard.awaitingDispatch', 'awaiting dispatch')
          }
        ].map((stat) => (
          <Grid.Col key={stat.title} span={{ base: 12, sm: 6, md: 3 }}>
            <StatCard {...stat} />
          </Grid.Col>
        ))}
      </Grid>

      <Grid gutter="sm">
        {[
          {
            title: t('dashboard.enRoute', 'En Route'),
            value: String(enRouteCount),
            icon: Navigation,
            color: 'blue',
            description: t('dashboard.enRouteDesc', 'agents traveling to job')
          },
          {
            title: t('dashboard.onSite', 'On Site'),
            value: String(onSiteCount),
            icon: MapPin,
            color: 'cyan',
            description: t('dashboard.onSiteDesc', 'agents currently at job')
          },
          {
            title: t('dashboard.assignedWaiting', 'Assigned'),
            value: String(assignedCount),
            icon: ClipboardList,
            color: 'grape',
            description: t('dashboard.assignedDesc', 'dispatched, not yet traveling')
          },
          {
            title: t('dashboard.totalJobs', 'Total Jobs'),
            value: String(jobs.length),
            icon: Briefcase,
            color: 'gray',
            description: t('dashboard.totalJobsDesc', 'all jobs recorded')
          }
        ].map((stat) => (
          <Grid.Col key={stat.title} span={{ base: 12, sm: 6, md: 3 }}>
            <StatCard {...stat} />
          </Grid.Col>
        ))}
      </Grid>

      <Grid gutter="sm">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <DashboardTable
            title={t('dashboard.recentJobs', 'Recent Dispatch Jobs')}
            subtitle={t('dashboard.recentJobsSubtitle', 'Active jobs and field operations tracking')}
            jobs={recentJobs}
            loading={isLoadingJobs}
            emptyMessage={t('dashboard.noJobsMessage', 'No jobs created yet.')}
            viewAllTo="/jobs"
            viewAllLabel={t('dashboard.viewAllJobs', 'View All Jobs')}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Stack gap="sm">
            <Card radius="md" withBorder shadow="xs" p="md">
              <Group justify="space-between" mb="xs">
                <Title order={5}>{t('dashboard.dispatchCompletion', 'Dispatch Completion')}</Title>
                <Text size="xs" c="dimmed" fw={600}>
                  {completedToday} / {jobs.length} {t('dashboard.jobsShort', 'Jobs')}
                </Text>
              </Group>
              <Group justify="center" my="xs">
                <RingProgress
                  size={130}
                  thickness={12}
                  roundCaps
                  sections={[{ value: completionPct, color: primaryColor }]}
                  label={
                    <Text ta="center" fw={700} size="lg">
                      {completionPct}%
                    </Text>
                  }
                />
              </Group>
              <Text size="xs" c="dimmed" ta="center">
                {t('dashboard.dispatchProgressLabel', 'Live metrics for company operations')}
              </Text>
            </Card>

            <Card radius="md" withBorder shadow="xs" p="md">
              <Group justify="space-between" mb="sm">
                <Title order={5}>{t('dashboard.fieldAgents', 'Field Agents')}</Title>
                <Button
                  size="xs"
                  variant="subtle"
                  color={primaryColor}
                  component={Link}
                  to="/agents"
                >
                  {t('dashboard.viewAllAgents', 'View All')}
                </Button>
              </Group>
              <Stack gap="xs">
                {isLoadingTechs ? (
                  <Text size="xs" c="dimmed">
                    {t('common.loading', 'Loading agents...')}
                  </Text>
                ) : agents.length === 0 ? (
                  <Text size="xs" c="dimmed">
                    {t('dashboard.noAgentsMessage', 'No agents available.')}
                  </Text>
                ) : (
                  agents.slice(0, 4).map((tech) => (
                    <Paper
                      key={tech.id}
                      p="xs"
                      radius="sm"
                      withBorder
                      bg="var(--mantine-color-body)"
                    >
                      <Group justify="space-between">
                        <Group gap="xs">
                          <Avatar size="sm" radius="xl" color={primaryColor}>
                            {tech.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <div>
                            <Text size="xs" fw={600}>
                              {tech.name}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {tech.phone || t('dashboard.noPhone', 'No phone')}
                            </Text>
                          </div>
                        </Group>
                        <Badge
                          size="xs"
                          variant="light"
                          color={
                            tech.status === AgentStatus.AVAILABLE
                              ? 'green'
                              : tech.status === AgentStatus.BUSY
                                ? 'orange'
                                : 'gray'
                          }
                        >
                          {tech.status}
                        </Badge>
                      </Group>
                    </Paper>
                  ))
                )}
              </Stack>
            </Card>
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  )
}