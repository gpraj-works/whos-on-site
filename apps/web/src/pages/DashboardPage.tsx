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
import {
  CheckCircle2,
  Clock,
  MapPin,
  Plus,
  RefreshCw,
  ShieldCheck,
  Truck,
  Users
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { useAppTheme } from '../app/theme/ThemeContext'
import { PageHeader } from '../components/common/PageHeader'
import { StatusBadge } from '../components/common/StatusBadge'
import { useAuth } from '../features/auth/context/AuthContext'

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation()
  const { user, company } = useAuth()
  const { primaryColor } = useAppTheme()

  const companyName = company?.name || 'WhosOnSite Operations'

  // Demo dispatch metrics data
  const stats = [
    {
      title: 'Active Jobs',
      value: '14',
      diff: 12,
      icon: Truck,
      color: primaryColor,
      description: '4 en route, 6 on site, 4 unassigned'
    },
    {
      title: 'Technicians Online',
      value: '8 / 10',
      diff: 80,
      icon: Users,
      color: 'blue',
      description: '6 available, 2 busy'
    },
    {
      title: 'Completed Today',
      value: '28',
      diff: 18,
      icon: CheckCircle2,
      color: 'green',
      description: '98% SLA compliance rate'
    },
    {
      title: 'Avg. Dispatch Time',
      value: '14.2 min',
      diff: -8,
      icon: Clock,
      color: 'violet',
      description: '2.5 min faster than target'
    }
  ]

  // Demo recent dispatch jobs list
  const recentJobs = [
    {
      id: 'JOB-1092',
      customer: 'Acme Logistics Center',
      address: '1420 Peachtree St NE, Atlanta, GA',
      status: JobStatus.EN_ROUTE,
      technician: 'Marcus Vance',
      scheduledAt: '10:30 AM',
      priority: 'High'
    },
    {
      id: 'JOB-1091',
      customer: 'Piedmont Health Facility',
      address: '1968 Peachtree Rd NW, Atlanta, GA',
      status: JobStatus.ON_SITE,
      technician: 'Sarah Jenkins',
      scheduledAt: '09:15 AM',
      priority: 'Urgent'
    },
    {
      id: 'JOB-1090',
      customer: 'Midtown Tech Hub',
      address: '75 5th St NW, Atlanta, GA',
      status: JobStatus.UNASSIGNED,
      technician: 'Unassigned',
      scheduledAt: '11:00 AM',
      priority: 'Normal'
    },
    {
      id: 'JOB-1089',
      customer: 'Buckhead Plaza Office',
      address: '3344 Peachtree Rd, Atlanta, GA',
      status: JobStatus.COMPLETE,
      technician: 'Alex Rivera',
      scheduledAt: '08:00 AM',
      priority: 'Normal'
    }
  ]

  // Demo online technicians summary
  const activeTechs = [
    { name: 'Sarah Jenkins', status: TechnicianStatus.BUSY, jobsToday: 4, battery: '88%' },
    { name: 'Marcus Vance', status: TechnicianStatus.AVAILABLE, jobsToday: 5, battery: '94%' },
    { name: 'Alex Rivera', status: TechnicianStatus.AVAILABLE, jobsToday: 3, battery: '76%' },
    { name: 'David Chen', status: TechnicianStatus.OFFLINE, jobsToday: 2, battery: '--' }
  ]

  return (
    <Container size="xl" py="lg">
      <Stack gap="lg">
        {/* Welcome Header */}
        <PageHeader
          title={t('nav.dashboard')}
          subtitle={`Real-time dispatch overview for ${companyName}`}
          actions={
            <Group gap="xs">
              <Button
                variant="default"
                leftSection={<RefreshCw size={16} />}
                onClick={() => window.location.reload()}
              >
                Refresh
              </Button>
              <Button leftSection={<Plus size={16} />} color={primaryColor}>
                New Dispatch Job
              </Button>
            </Group>
          }
        />

        {/* User Role Banner */}
        <Paper p="md" radius="md" bg="var(--mantine-color-body)" withBorder>
          <Group justify="space-between" align="center" wrap="wrap" gap="md">
            <Group gap="md" style={{ minWidth: 0 }}>
              <Avatar color={primaryColor} radius="xl" size="md">
                <ShieldCheck size={24} />
              </Avatar>
              <div style={{ minWidth: 0 }}>
                <Group gap="xs">
                  <Text fw={700} size="sm" truncate>
                    {user?.email}
                  </Text>
                  <Badge size="xs" color={primaryColor} variant="filled" tt="uppercase">
                    {user?.role}
                  </Badge>
                </Group>
                <Text size="xs" c="dimmed" hiddenFrom="sm" truncate>
                  Company: {company?.id?.slice(0, 8)}...
                </Text>
              </div>
            </Group>
            <Button size="xs" variant="light" color={primaryColor} component={Link} to="/settings">
              Manage Security & Settings
            </Button>
          </Group>
        </Paper>

        {/* KPI Metrics Grid */}
        <Grid>
          {stats.map((stat) => (
            <Grid.Col key={stat.title} span={{ base: 12, sm: 6, md: 3 }}>
              <Card p="md" radius="md" withBorder shadow="xs">
                <Group justify="space-between" align="flex-start" mb="xs">
                  <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                    {stat.title}
                  </Text>
                  <ActionIcon color={stat.color} variant="light" radius="md" size="lg">
                    <stat.icon size={20} />
                  </ActionIcon>
                </Group>

                <Group align="flex-end" gap="xs" mb={4}>
                  <Title order={2}>{stat.value}</Title>
                  <Badge size="xs" color={stat.diff >= 0 ? 'green' : 'orange'} variant="light">
                    {stat.diff >= 0 ? `+${stat.diff}%` : `${stat.diff}%`}
                  </Badge>
                </Group>

                <Text size="xs" c="dimmed">
                  {stat.description}
                </Text>
              </Card>
            </Grid.Col>
          ))}
        </Grid>

        {/* Main Content: Recent Dispatch Activity & Tech Status Overview */}
        <Grid>
          {/* Left Column: Recent Dispatch Jobs */}
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <Card radius="md" withBorder shadow="xs" p="md">
              <Group justify="space-between" mb="md">
                <div>
                  <Title order={4}>Live Dispatch Board</Title>
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
                    <Table.Th hiddenFrom="sm">Time</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {recentJobs.map((job) => (
                    <Table.Tr key={job.id}>
                      <Table.Td>
                        <Text size="xs" fw={700}>
                          {job.id}
                        </Text>
                        {job.priority === 'Urgent' && (
                          <Badge size="xs" color="red" variant="dot">
                            Urgent
                          </Badge>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Text size="xs" fw={600} truncate maw={160}>
                          {job.customer}
                        </Text>
                        <Group gap={4}>
                          <MapPin size={12} style={{ opacity: 0.6, flexShrink: 0 }} />
                          <Text size="xs" c="dimmed" truncate max-width={200}>
                            {job.address}
                          </Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <StatusBadge status={job.status} />
                      </Table.Td>
                      <Table.Td hiddenFrom="sm">
                        <Text size="xs" fw={500}>
                          {job.technician}
                        </Text>
                      </Table.Td>
                      <Table.Td hiddenFrom="sm">
                        <Text size="xs" c="dimmed">
                          {job.scheduledAt}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Card>
          </Grid.Col>

          {/* Right Column: Technician Readiness & Daily Target Ring */}
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Stack gap="md">
              {/* Daily Completion Progress Card */}
              <Card radius="md" withBorder shadow="xs" p="md">
                <Group justify="space-between" mb="xs">
                  <Title order={5}>Daily Completion Goal</Title>
                  <Text size="xs" c="dimmed" fw={600}>
                    28 / 35 Jobs
                  </Text>
                </Group>
                <Group justify="center" my="xs">
                  <RingProgress
                    size={130}
                    thickness={12}
                    roundCaps
                    sections={[{ value: 80, color: primaryColor }]}
                    label={
                      <Text ta="center" fw={700} size="lg">
                        80%
                      </Text>
                    }
                  />
                </Group>
                <Text size="xs" c="dimmed" ta="center">
                  On track to meet target for {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                </Text>
              </Card>

              {/* Technician Status List */}
              <Card radius="md" withBorder shadow="xs" p="md">
                <Title order={5} mb="sm">
                  Field Technicians
                </Title>
                <Stack gap="xs">
                  {activeTechs.map((tech) => (
                    <Paper key={tech.name} p="xs" radius="sm" withBorder bg="var(--mantine-color-body)">
                      <Group justify="space-between">
                        <Group gap="xs">
                          <Avatar size="sm" radius="xl" color={primaryColor}>
                            {tech.name.charAt(0)}
                          </Avatar>
                          <div>
                            <Text size="xs" fw={600}>
                              {tech.name}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {tech.jobsToday} jobs completed
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
                  ))}
                </Stack>
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  )
}

export default DashboardPage
