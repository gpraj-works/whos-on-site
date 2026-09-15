import React from 'react'
import {
  Badge,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Paper,
  Progress,
  Stack,
  Text,
  Title,
  Tooltip
} from '@mantine/core'
import { JobStatus, TechnicianStatus } from '@whosonsite/shared'
import {
  BarChart2,
  Briefcase,
  CheckCircle2,
  Clock,
  RefreshCw,
  Timer,
  UserCheck,
  Users
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useAppTheme } from '../app/theme/ThemeContext'
import { useAnalyticsSummary } from '../components/analytics/queries'
import { PageHeader } from '../components/common/PageHeader'
import { StatusBadge } from '../components/common/StatusBadge'

const JOB_STATUS_COLORS: Record<JobStatus, string> = {
  [JobStatus.UNASSIGNED]: 'orange',
  [JobStatus.ASSIGNED]: 'blue',
  [JobStatus.EN_ROUTE]: 'yellow',
  [JobStatus.ON_SITE]: 'teal',
  [JobStatus.COMPLETE]: 'green',
  [JobStatus.CANCELLED]: 'red'
}

export const Analytics: React.FC = () => {
  const { t } = useTranslation()
  const { primaryColor } = useAppTheme()
  const { data: summary, isLoading, refetch, isRefetching } = useAnalyticsSummary()

  const activeJobsCount =
    (summary?.jobsByStatus.assigned || 0) +
    (summary?.jobsByStatus.en_route || 0) +
    (summary?.jobsByStatus.on_site || 0)

  // Find max daily count for scaling the 14-day bar chart
  const maxDailyCount = Math.max(
    ...(summary?.jobsCreatedLast14Days.map((d) => d.count) || [1]),
    1
  )

  return (
    <Container fluid p={0}>
      <Stack gap="sm">
        <PageHeader
          title={t('analytics.title', 'Operations Analytics')}
          subtitle={t(
            'analytics.subtitle',
            'Real-time company metrics, job status breakdown, completion performance, and technician tracking'
          )}
          actions={
            <Button
              variant="default"
              leftSection={<RefreshCw size={16} className={isRefetching ? 'spin' : ''} />}
              onClick={() => refetch()}
              loading={isLoading}
            >
              {t('common.refresh', 'Refresh')}
            </Button>
          }
        />

        {/* Stat Cards Row */}
        <Grid gutter="sm">
          <Grid.Col span={{ base: 12, sm: 6, md: 2.4 }}>
            <Card withBorder radius="md" p="md">
              <Group justify="space-between">
                <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                  Total Jobs
                </Text>
                <Briefcase size={20} style={{ color: 'gray' }} />
              </Group>
              <Text fw={700} size="xl" mt="xs">
                {isLoading ? '...' : summary?.totalJobsCount || 0}
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                All time company dispatches
              </Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 2.4 }}>
            <Card withBorder radius="md" p="md">
              <Group justify="space-between">
                <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                  Active Jobs
                </Text>
                <Clock size={20} style={{ color: 'var(--mantine-color-blue-6)' }} />
              </Group>
              <Text fw={700} size="xl" mt="xs" c="blue">
                {isLoading ? '...' : activeJobsCount}
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                Assigned, En Route & On Site
              </Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 2.4 }}>
            <Card withBorder radius="md" p="md">
              <Group justify="space-between">
                <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                  Completed
                </Text>
                <CheckCircle2 size={20} style={{ color: 'var(--mantine-color-green-6)' }} />
              </Group>
              <Text fw={700} size="xl" mt="xs" c="green">
                {isLoading ? '...' : summary?.jobsByStatus.complete || 0}
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                Successfully resolved
              </Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 2.4 }}>
            <Card withBorder radius="md" p="md">
              <Group justify="space-between">
                <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                  Avg Duration
                </Text>
                <Timer size={20} style={{ color: 'var(--mantine-color-indigo-6)' }} />
              </Group>
              <Text fw={700} size="xl" mt="xs" c="indigo">
                {isLoading ? '...' : `${summary?.avgCompletionTimeMinutes || 0}m`}
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                Mean job completion time
              </Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 2.4 }}>
            <Card withBorder radius="md" p="md">
              <Group justify="space-between">
                <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                  Field Techs
                </Text>
                <Users size={20} style={{ color: 'var(--mantine-color-teal-6)' }} />
              </Group>
              <Text fw={700} size="xl" mt="xs" c="teal">
                {isLoading ? '...' : summary?.totalTechniciansCount || 0}
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                Registered technicians
              </Text>
            </Card>
          </Grid.Col>
        </Grid>

        <Grid gutter="sm">
          {/* Jobs by Status Distribution */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper radius="md" p="md" withBorder style={{ height: '100%' }}>
              <Stack gap="md">
                <Group justify="space-between">
                  <Title order={5}>Jobs Distribution by Status</Title>
                  <BarChart2 size={18} style={{ color: 'gray' }} />
                </Group>

                {isLoading ? (
                  <Text size="xs" c="dimmed">
                    Loading breakdown...
                  </Text>
                ) : (
                  <Stack gap="sm">
                    {Object.values(JobStatus).map((status) => {
                      const count = summary?.jobsByStatus[status] || 0
                      const total = summary?.totalJobsCount || 1
                      const pct = Math.round((count / total) * 100)

                      return (
                        <div key={status}>
                          <Group justify="space-between" mb={4}>
                            <Group gap="xs">
                              <StatusBadge status={status} />
                              <Text size="xs" fw={600}>
                                {status.toUpperCase().replace('_', ' ')}
                              </Text>
                            </Group>
                            <Text size="xs" fw={700}>
                              {count} ({pct}%)
                            </Text>
                          </Group>
                          <Progress
                            value={pct}
                            color={JOB_STATUS_COLORS[status]}
                            size="sm"
                            radius="xl"
                          />
                        </div>
                      )
                    })}
                  </Stack>
                )}
              </Stack>
            </Paper>
          </Grid.Col>

          {/* Technician Availability Overview */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper radius="md" p="md" withBorder style={{ height: '100%' }}>
              <Stack gap="md">
                <Group justify="space-between">
                  <Title order={5}>Field Technician Availability</Title>
                  <UserCheck size={18} style={{ color: 'gray' }} />
                </Group>

                {isLoading ? (
                  <Text size="xs" c="dimmed">
                    Loading availability...
                  </Text>
                ) : (
                  <Stack gap="md">
                    <Grid gutter="sm">
                      <Grid.Col span={4}>
                        <Paper p="sm" withBorder radius="md" ta="center" bg="var(--mantine-color-green-0)">
                          <Badge color="green" size="sm" mb={4}>
                            AVAILABLE
                          </Badge>
                          <Text fw={700} size="lg" c="green">
                            {summary?.technicianAvailability[TechnicianStatus.AVAILABLE] || 0}
                          </Text>
                        </Paper>
                      </Grid.Col>

                      <Grid.Col span={4}>
                        <Paper p="sm" withBorder radius="md" ta="center" bg="var(--mantine-color-orange-0)">
                          <Badge color="orange" size="sm" mb={4}>
                            BUSY
                          </Badge>
                          <Text fw={700} size="lg" c="orange">
                            {summary?.technicianAvailability[TechnicianStatus.BUSY] || 0}
                          </Text>
                        </Paper>
                      </Grid.Col>

                      <Grid.Col span={4}>
                        <Paper p="sm" withBorder radius="md" ta="center" bg="var(--mantine-color-gray-0)">
                          <Badge color="gray" size="sm" mb={4}>
                            OFFLINE
                          </Badge>
                          <Text fw={700} size="lg" c="gray">
                            {summary?.technicianAvailability[TechnicianStatus.OFFLINE] || 0}
                          </Text>
                        </Paper>
                      </Grid.Col>
                    </Grid>

                    <Paper p="sm" withBorder radius="md">
                      <Text size="xs" fw={600} mb="xs">
                        Overall Capacity Split
                      </Text>
                      <Progress.Root size="xl" radius="xl">
                        <Tooltip label={`Available: ${summary?.technicianAvailability[TechnicianStatus.AVAILABLE] || 0}`}>
                          <Progress.Section
                            value={
                              ((summary?.technicianAvailability[TechnicianStatus.AVAILABLE] || 0) /
                                (summary?.totalTechniciansCount || 1)) *
                              100
                            }
                            color="green"
                          >
                            <Progress.Label>Available</Progress.Label>
                          </Progress.Section>
                        </Tooltip>
                        <Tooltip label={`Busy: ${summary?.technicianAvailability[TechnicianStatus.BUSY] || 0}`}>
                          <Progress.Section
                            value={
                              ((summary?.technicianAvailability[TechnicianStatus.BUSY] || 0) /
                                (summary?.totalTechniciansCount || 1)) *
                              100
                            }
                            color="orange"
                          >
                            <Progress.Label>Busy</Progress.Label>
                          </Progress.Section>
                        </Tooltip>
                        <Tooltip label={`Offline: ${summary?.technicianAvailability[TechnicianStatus.OFFLINE] || 0}`}>
                          <Progress.Section
                            value={
                              ((summary?.technicianAvailability[TechnicianStatus.OFFLINE] || 0) /
                                (summary?.totalTechniciansCount || 1)) *
                              100
                            }
                            color="gray"
                          >
                            <Progress.Label>Offline</Progress.Label>
                          </Progress.Section>
                        </Tooltip>
                      </Progress.Root>
                    </Paper>
                  </Stack>
                )}
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>

        {/* 14-Day Job Creation Trend (Dependency-Light Bar Visualization) */}
        <Paper radius="md" p="md" withBorder>
          <Stack gap="sm">
            <Group justify="space-between">
              <div>
                <Title order={5}>Job Creation Trend (Last 14 Days)</Title>
                <Text size="xs" c="dimmed">
                  Daily job creation velocity across company dispatches
                </Text>
              </div>
              <Badge color={primaryColor} variant="light">
                Past 14 Days
              </Badge>
            </Group>

            {isLoading ? (
              <Text size="xs" c="dimmed">
                Loading trend...
              </Text>
            ) : (
              <div style={{ width: '100%', height: '180px', display: 'flex', alignItems: 'flex-end', gap: '8px', paddingTop: '20px' }}>
                {summary?.jobsCreatedLast14Days.map((dayItem) => {
                  const pct = Math.round((dayItem.count / maxDailyCount) * 100)
                  const heightPct = Math.max(pct, 6) // Minimum bar height for visibility

                  return (
                    <div
                      key={dayItem.date}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        height: '100%',
                        justifyContent: 'flex-end'
                      }}
                    >
                      <Tooltip label={`${dayItem.date}: ${dayItem.count} jobs`}>
                        <div
                          style={{
                            width: '100%',
                            height: `${heightPct}%`,
                            backgroundColor: dayItem.count > 0 ? 'var(--mantine-color-blue-6)' : 'var(--mantine-color-gray-3)',
                            borderRadius: '4px 4px 0 0',
                            transition: 'height 0.3s ease, background-color 0.2s ease',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {dayItem.count > 0 && (
                            <Text size="10px" fw={700} c="white">
                              {dayItem.count}
                            </Text>
                          )}
                        </div>
                      </Tooltip>
                      <Text size="10px" c="dimmed" mt={4} style={{ whiteSpace: 'nowrap' }}>
                        {dayItem.date.slice(5)}
                      </Text>
                    </div>
                  )
                })}
              </div>
            )}
          </Stack>
        </Paper>
      </Stack>
    </Container>
  )
}

export default Analytics
