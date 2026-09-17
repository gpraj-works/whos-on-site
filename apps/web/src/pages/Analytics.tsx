import React from 'react'
import {
  Badge,
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
import { BarChart, DonutChart } from '@mantine/charts'
import { JobStatus, AgentStatus } from '@whosonsite/shared'
import {
  BarChart2,
  Briefcase,
  CheckCircle2,
  Clock,
  Timer,
  UserCheck,
  Users
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { JOB_STATUS_COLORS, useAppTheme } from '../app/theme'
import { useAnalyticsSummary } from '../components/analytics/queries'
import { PageHeader } from '../components/common/PageHeader'

export const Analytics: React.FC = () => {
  const { t } = useTranslation()
  const { primaryColor } = useAppTheme()
  const { data: summary, isLoading } = useAnalyticsSummary()

  const activeJobsCount =
    (summary?.jobsByStatus.assigned || 0) +
    (summary?.jobsByStatus.en_route || 0) +
    (summary?.jobsByStatus.on_site || 0)

  const statusData = Object.values(JobStatus)
    .map((status) => ({
      name: status.toUpperCase().replace('_', ' '),
      value: summary?.jobsByStatus[status] || 0,
      color: JOB_STATUS_COLORS[status]
    }))
    .filter((item) => item.value > 0)

  const trendData =
    summary?.jobsCreatedLast14Days.map((d) => ({
      date: d.date.slice(5),
      jobs: d.count
    })) || []

  return (
    <Container fluid p={0}>
      <Stack gap="sm">
        <PageHeader
          title={t('analytics.title', 'Operations Analytics')}
          subtitle={t(
            'analytics.subtitle',
            'Real-time company metrics, job status breakdown, completion performance, and agent tracking'
          )}
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
                {isLoading ? '...' : summary?.totalAgentsCount || 0}
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                Registered agents
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
                  <Stack align="center" gap="md">
                    <DonutChart
                      h={220}
                      w={220}
                      data={statusData}
                      thickness={26}
                      paddingAngle={2}
                      withLabels
                      labelsType="percent"
                      chartLabel={`${summary?.totalJobsCount || 0} Jobs`}
                    />
                    <Group gap="sm" justify="center" wrap="wrap">
                      {statusData.map((item) => (
                        <Group key={item.name} gap={6}>
                          <span
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              backgroundColor: `var(--mantine-color-${item.color}-6)`,
                              display: 'inline-block'
                            }}
                          />
                          <Text size="xs" fw={600}>
                            {item.name} ({item.value})
                          </Text>
                        </Group>
                      ))}
                    </Group>
                  </Stack>
                )}
              </Stack>
            </Paper>
          </Grid.Col>

          {/* Agent Availability Overview */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper radius="md" p="md" withBorder style={{ height: '100%' }}>
              <Stack gap="md">
                <Group justify="space-between">
                  <Title order={5}>Field Agent Availability</Title>
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
                            {summary?.agentAvailability[AgentStatus.AVAILABLE] || 0}
                          </Text>
                        </Paper>
                      </Grid.Col>

                      <Grid.Col span={4}>
                        <Paper p="sm" withBorder radius="md" ta="center" bg="var(--mantine-color-orange-0)">
                          <Badge color="orange" size="sm" mb={4}>
                            BUSY
                          </Badge>
                          <Text fw={700} size="lg" c="orange">
                            {summary?.agentAvailability[AgentStatus.BUSY] || 0}
                          </Text>
                        </Paper>
                      </Grid.Col>

                      <Grid.Col span={4}>
                        <Paper p="sm" withBorder radius="md" ta="center" bg="var(--mantine-color-gray-0)">
                          <Badge color="gray" size="sm" mb={4}>
                            OFFLINE
                          </Badge>
                          <Text fw={700} size="lg" c="gray">
                            {summary?.agentAvailability[AgentStatus.OFFLINE] || 0}
                          </Text>
                        </Paper>
                      </Grid.Col>
                    </Grid>

                    <Paper p="sm" withBorder radius="md">
                      <Text size="xs" fw={600} mb="xs">
                        Overall Capacity Split
                      </Text>
                      <Progress.Root size="xl" radius="xl">
                        <Tooltip label={`Available: ${summary?.agentAvailability[AgentStatus.AVAILABLE] || 0}`}>
                          <Progress.Section
                            value={
                              ((summary?.agentAvailability[AgentStatus.AVAILABLE] || 0) /
                                (summary?.totalAgentsCount || 1)) *
                              100
                            }
                            color="green"
                          >
                            <Progress.Label>Available</Progress.Label>
                          </Progress.Section>
                        </Tooltip>
                        <Tooltip label={`Busy: ${summary?.agentAvailability[AgentStatus.BUSY] || 0}`}>
                          <Progress.Section
                            value={
                              ((summary?.agentAvailability[AgentStatus.BUSY] || 0) /
                                (summary?.totalAgentsCount || 1)) *
                              100
                            }
                            color="orange"
                          >
                            <Progress.Label>Busy</Progress.Label>
                          </Progress.Section>
                        </Tooltip>
                        <Tooltip label={`Offline: ${summary?.agentAvailability[AgentStatus.OFFLINE] || 0}`}>
                          <Progress.Section
                            value={
                              ((summary?.agentAvailability[AgentStatus.OFFLINE] || 0) /
                                (summary?.totalAgentsCount || 1)) *
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
              <BarChart
                h={240}
                data={trendData}
                dataKey="date"
                series={[{ name: 'jobs', color: primaryColor }]}
                withBarValueLabel
                withTooltip
                tickLine="y"
                gridAxis="xy"
              />
            )}
          </Stack>
        </Paper>
      </Stack>
    </Container>
  )
}

export default Analytics
