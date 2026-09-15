import React from 'react'
import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Paper,
  RingProgress,
  Stack,
  Table,
  Text,
  Title
} from '@mantine/core'
import { JobStatus, TechnicianStatus } from '@whosonsite/shared'
import { CheckCircle2, Clock, MapPin, Truck, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { useAppTheme } from '../app/theme/ThemeContext'
import { StatusBadge } from '../components/common/StatusBadge'
import { ApiErrorAlert } from '../components/feedback/ApiErrorAlert'
import { useJobs } from '../components/jobs/queries'
import { useTechnicians } from '../components/technicians/queries'
import { formatDateTime } from '../lib/date/format'

export const Dashboard: React.FC = () => {
  const { t } = useTranslation()
  const { primaryColor } = useAppTheme()

  const {
    data: jobs = [],
    isLoading: isLoadingJobs,
    error: jobsError
  } = useJobs()
  const {
    data: technicians = [],
    isLoading: isLoadingTechs,
    error: techsError
  } = useTechnicians()

  const activeJobs = jobs.filter(
    (j) => j.status !== JobStatus.COMPLETE && j.status !== JobStatus.CANCELLED
  )
  const unassignedCount = jobs.filter((j) => j.status === JobStatus.UNASSIGNED).length
  const enRouteCount = jobs.filter((j) => j.status === JobStatus.EN_ROUTE).length
  const onSiteCount = jobs.filter((j) => j.status === JobStatus.ON_SITE).length

  const onlineTechs = technicians.filter((t) => t.status !== TechnicianStatus.OFFLINE)
  const availableTechs = technicians.filter((t) => t.status === TechnicianStatus.AVAILABLE)
  const busyTechs = technicians.filter((t) => t.status === TechnicianStatus.BUSY)

  const completedToday = jobs.filter((j) => j.status === JobStatus.COMPLETE).length

  const stats = [
    {
      title: t('dashboard.activeJobs', 'Active Jobs'),
      value: String(activeJobs.length),
      icon: Truck,
      color: primaryColor,
      description: `${enRouteCount} en route, ${onSiteCount} on site, ${unassignedCount} unassigned`
    },
    {
      title: t('dashboard.techniciansOnline', 'Technicians Online'),
      value: `${onlineTechs.length} / ${technicians.length}`,
      icon: Users,
      color: 'blue',
      description: `${availableTechs.length} available, ${busyTechs.length} busy`
    },
    {
      title: t('dashboard.completedToday', 'Completed Jobs'),
      value: String(completedToday),
      icon: CheckCircle2,
      color: 'green',
      description: `${jobs.length} total jobs recorded`
    },
    {
      title: t('dashboard.totalTechnicians', 'Total Technicians'),
      value: String(technicians.length),
      icon: Clock,
      color: 'violet',
      description: `${onlineTechs.length} currently online in field`
    }
  ]

  const recentJobs = jobs.slice(0, 5)

  return (
    <Container fluid p={0}>
      <Stack gap="sm">
        <ApiErrorAlert error={jobsError || techsError} />

        {/* KPI Metrics Grid */}
        <Grid gutter="sm">
          {stats.map((stat) => (
            <Grid.Col key={stat.title} span={{ base: 12, sm: 6, md: 3 }}>
              <Card p="md" radius="md" withBorder shadow="xs">
                <Group justify="space-between" align="center">
                  <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                    {stat.title}
                  </Text>
                  <ActionIcon color={stat.color} variant="light" radius="md" size="lg">
                    <stat.icon size={20} />
                  </ActionIcon>
                </Group>

                <Group align="flex-end" gap="xs" mb={4}>
                  <Title order={2}>{stat.value}</Title>
                </Group>

                <Text size="xs" c="dimmed">
                  {stat.description}
                </Text>
              </Card>
            </Grid.Col>
          ))}
        </Grid>

        {/* Main Content: Live Dispatch Jobs & Tech Status Overview */}
        <Grid gutter="sm">
          {/* Left Column: Recent Dispatch Jobs */}
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <Card radius="md" withBorder shadow="xs" p="md">
              <Group justify="space-between" mb="md">
                <div>
                  <Title order={4}>{t('jobs.title', 'Jobs')}</Title>
                  <Text size="xs" c="dimmed">
                    Active jobs and field operations tracking
                  </Text>
                </div>
                <Button size="xs" variant="subtle" color={primaryColor} component={Link} to="/jobs">
                  View All Jobs
                </Button>
              </Group>

              <Table highlightOnHover verticalSpacing="sm">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Job ID</Table.Th>
                    <Table.Th>Customer & Address</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th hiddenFrom="sm">Technician</Table.Th>
                    <Table.Th hiddenFrom="sm">Scheduled At</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {isLoadingJobs ? (
                    <Table.Tr>
                      <Table.Td colSpan={5} ta="center" py="lg">
                        <Text size="xs" c="dimmed">
                          {t('common.loading', 'Loading jobs...')}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ) : recentJobs.length === 0 ? (
                    <Table.Tr>
                      <Table.Td colSpan={5} ta="center" py="lg">
                        <Text size="xs" c="dimmed">
                          {t('common.noData', 'No jobs created yet.')}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    recentJobs.map((job) => (
                      <Table.Tr key={job.id}>
                        <Table.Td>
                          <Text size="xs" fw={700}>
                            {job.id.slice(0, 8)}...
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="xs" fw={600} truncate maw={180}>
                            {job.customer?.name || t('jobs.noCustomer', 'Unassigned Customer')}
                          </Text>
                          {job.customer?.address && (
                            <Group gap={4}>
                              <MapPin size={12} style={{ opacity: 0.6, flexShrink: 0 }} />
                              <Text size="xs" c="dimmed" truncate maw={200}>
                                {job.customer.address}
                              </Text>
                            </Group>
                          )}
                        </Table.Td>
                        <Table.Td>
                          <StatusBadge status={job.status} />
                        </Table.Td>
                        <Table.Td hiddenFrom="sm">
                          <Text size="xs" fw={500}>
                            {job.assignedTechnicianName || (
                              <Text span c="dimmed" fs="italic">
                                Unassigned
                              </Text>
                            )}
                          </Text>
                        </Table.Td>
                        <Table.Td hiddenFrom="sm">
                          <Text size="xs" c="dimmed">
                            {formatDateTime(job.scheduledAt)}
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    ))
                  )}
                </Table.Tbody>
              </Table>
            </Card>
          </Grid.Col>

          {/* Right Column: Technician Readiness & Progress */}
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Stack gap="sm">
              {/* Daily Completion Progress Card */}
              <Card radius="md" withBorder shadow="xs" p="md">
                <Group justify="space-between" mb="xs">
                  <Title order={5}>Dispatch Completion</Title>
                  <Text size="xs" c="dimmed" fw={600}>
                    {completedToday} / {jobs.length} Jobs
                  </Text>
                </Group>
                <Group justify="center" my="xs">
                  <RingProgress
                    size={130}
                    thickness={12}
                    roundCaps
                    sections={[
                      {
                        value:
                          jobs.length > 0 ? Math.round((completedToday / jobs.length) * 100) : 0,
                        color: primaryColor
                      }
                    ]}
                    label={
                      <Text ta="center" fw={700} size="lg">
                        {jobs.length > 0
                          ? `${Math.round((completedToday / jobs.length) * 100)}%`
                          : '0%'}
                      </Text>
                    }
                  />
                </Group>
                <Text size="xs" c="dimmed" ta="center">
                  Live metrics for company operations
                </Text>
              </Card>

              {/* Technician Status List */}
              <Card radius="md" withBorder shadow="xs" p="md">
                <Group justify="space-between" mb="sm">
                  <Title order={5}>Field Technicians</Title>
                  <Button
                    size="xs"
                    variant="subtle"
                    color={primaryColor}
                    component={Link}
                    to="/technicians"
                  >
                    View All
                  </Button>
                </Group>
                <Stack gap="xs">
                  {isLoadingTechs ? (
                    <Text size="xs" c="dimmed">
                      {t('common.loading', 'Loading technicians...')}
                    </Text>
                  ) : technicians.length === 0 ? (
                    <Text size="xs" c="dimmed">
                      No technicians available.
                    </Text>
                  ) : (
                    technicians.slice(0, 4).map((tech) => (
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
                                {tech.phone || 'No phone'}
                              </Text>
                            </div>
                          </Group>
                          <Badge
                            size="xs"
                            variant="light"
                            color={
                              tech.status === TechnicianStatus.AVAILABLE
                                ? 'green'
                                : tech.status === TechnicianStatus.BUSY
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
    </Container>
  )
}

export default Dashboard
