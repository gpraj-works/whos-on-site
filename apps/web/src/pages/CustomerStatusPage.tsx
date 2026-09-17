import React, { useEffect, useState } from 'react'
import {
  Alert,
  Badge,
  Box,
  Card,
  Container,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Timeline,
  Title
} from '@mantine/core'
import { CustomerStatusDto, JobStatus } from '@whosonsite/shared'
import { dayjs } from '@whosonsite/shared'
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Clock3,
  RefreshCw,
  Truck,
  User,
  Wrench,
  XCircle
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { Logo } from '../components/common/Logo'
import { apiClient } from '../lib/api/client'

const STEP_ORDER: JobStatus[] = [
  JobStatus.UNASSIGNED,
  JobStatus.ASSIGNED,
  JobStatus.EN_ROUTE,
  JobStatus.ON_SITE,
  JobStatus.COMPLETE
]

const STATUS_CONFIG: Record<
  JobStatus,
  { label: string; color: string; icon: React.ComponentType<{ size?: number }> }
> = {
  [JobStatus.UNASSIGNED]: { label: 'Unassigned', color: 'gray', icon: Clock },
  [JobStatus.ASSIGNED]: { label: 'Agent Assigned', color: 'blue', icon: User },
  [JobStatus.EN_ROUTE]: { label: 'En Route', color: 'cyan', icon: Truck },
  [JobStatus.ON_SITE]: { label: 'Agent On Site', color: 'teal', icon: Wrench },
  [JobStatus.COMPLETE]: { label: 'Job Complete', color: 'green', icon: CheckCircle2 },
  [JobStatus.CANCELLED]: { label: 'Cancelled', color: 'red', icon: XCircle }
}

export const CustomerStatusPage: React.FC = () => {
  const { token } = useParams<{ token: string }>()
  const { t } = useTranslation()

  const [data, setData] = useState<CustomerStatusDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string | null>(null)

  const fetchStatus = async (isPoll = false) => {
    if (!token) return
    if (!isPoll) setLoading(true)
    try {
      const res = await apiClient<CustomerStatusDto>(`/public/jobs/${token}`, { skipAuth: true })
      setData(res)
      setError(null)
      setLastRefreshedAt(dayjs().format('HH:mm:ss'))
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('customerStatus.notFoundSubtitle')
      setError(msg)
    } finally {
      if (!isPoll) setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(() => {
      fetchStatus(true)
    }, 30000)
    return () => clearInterval(interval)
  }, [token])

  if (loading) {
    return (
      <Container size="sm" py="xl">
        <Paper p="xl" radius="md" withBorder style={{ textAlign: 'center' }}>
          <Loader size="lg" color="teal" mx="auto" my="xl" />
          <Text c="dimmed" size="sm">
            {t('common.loading')}
          </Text>
        </Paper>
      </Container>
    )
  }

  if (error || !data) {
    return (
      <Container size="sm" py="xl">
        <Paper p="xl" radius="md" withBorder style={{ textAlign: 'center' }}>
          <ThemeIcon size={56} radius="xl" color="red" variant="light" mx="auto" mb="md">
            <AlertCircle size={32} />
          </ThemeIcon>
          <Title order={3} mb="xs">
            {t('customerStatus.notFoundTitle')}
          </Title>
          <Text c="dimmed" size="sm" mb="lg">
            {error || t('customerStatus.notFoundSubtitle')}
          </Text>
        </Paper>
      </Container>
    )
  }

  const currentStatusIndex = STEP_ORDER.indexOf(data.status)
  const isCancelled = data.status === 'cancelled'
  const statusCfg = STATUS_CONFIG[data.status] || STATUS_CONFIG.unassigned
  const StatusIcon = statusCfg.icon

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: 'var(--mantine-color-body)' }} py="lg">
      <Container size="sm">
        {/* Top Header Card */}
        <Card radius="md" withBorder p="lg" mb="md" style={{ borderTop: `4px solid ${data.companyPrimaryColor}` }}>
          <Group justify="space-between" align="center" mb="xs">
            <Group gap="xs">
              <Logo size={28} color={data.companyPrimaryColor} />
              <Title order={4}>{data.companyName}</Title>
            </Group>
            <Badge size="lg" color={statusCfg.color} variant="filled" leftSection={<StatusIcon size={14} />}>
              {t(`status.${data.status}`, { defaultValue: statusCfg.label })}
            </Badge>
          </Group>
          <Text size="sm" c="dimmed">
            {t('customerStatus.title')} — #{data.jobId.slice(0, 8)}
          </Text>
        </Card>

        {/* Cancelled Alert if applicable */}
        {isCancelled && (
          <Alert icon={<XCircle size={20} />} title={t('status.cancelled')} color="red" variant="filled" mb="md" radius="md">
            {t('jobs.cancelConfirmMessage')}
          </Alert>
        )}

        {/* Main Status Stepper Progress */}
        {!isCancelled && (
          <Card radius="md" withBorder p="lg" mb="md">
            <Text fw={600} size="sm" mb="md" c="dimmed">
              {t('customerStatus.timeline')}
            </Text>
            <Timeline active={currentStatusIndex} bulletSize={32} lineWidth={3} color="teal">
              {STEP_ORDER.map((st, idx) => {
                const cfg = STATUS_CONFIG[st]
                const IconComp = cfg.icon
                const isPassed = idx <= currentStatusIndex
                return (
                  <Timeline.Item
                    key={st}
                    bullet={
                      <ThemeIcon
                        size={24}
                        radius="xl"
                        color={isPassed ? 'teal' : 'gray'}
                        variant={isPassed ? 'filled' : 'light'}
                      >
                        <IconComp size={14} />
                      </ThemeIcon>
                    }
                    title={
                      <Text fw={isPassed ? 600 : 400} size="sm">
                        {t(`status.${st}`, { defaultValue: cfg.label })}
                      </Text>
                    }
                  />
                )
              })}
            </Timeline>
          </Card>
        )}

        {/* Job Details Card */}
        <Card radius="md" withBorder p="lg" mb="md">
          <Title order={5} mb="sm">
            Service Details
          </Title>
          <Stack gap="xs">
            <Group gap="xs">
              <User size={16} style={{ color: 'var(--mantine-color-dimmed)' }} />
              <Text size="sm" fw={500}>
                {t('customerStatus.customer')}:
              </Text>
              <Text size="sm">{data.customerName}</Text>
            </Group>

            <Group gap="xs">
              <Wrench size={16} style={{ color: 'var(--mantine-color-dimmed)' }} />
              <Text size="sm" fw={500}>
                {t('customerStatus.agent')}:
              </Text>
              <Text size="sm">
                {data.agentName || t('customerStatus.unassignedTech')}
              </Text>
            </Group>

            {data.scheduledAt && (
              <Group gap="xs">
                <Calendar size={16} style={{ color: 'var(--mantine-color-dimmed)' }} />
                <Text size="sm" fw={500}>
                  {t('customerStatus.scheduledAt')}:
                </Text>
                <Text size="sm">{dayjs(data.scheduledAt).format('MMM D, YYYY h:mm A')}</Text>
              </Group>
            )}

            <Group gap="xs">
              <Clock3 size={16} style={{ color: 'var(--mantine-color-dimmed)' }} />
              <Text size="sm" fw={500}>
                {t('customerStatus.lastUpdated')}:
              </Text>
              <Text size="sm">{dayjs(data.updatedAt).format('MMM D, YYYY h:mm A')}</Text>
            </Group>

            {data.notes && (
              <Box mt="xs" p="xs" style={{ borderRadius: 6, backgroundColor: 'var(--mantine-color-gray-0)' }}>
                <Text size="xs" c="dimmed" fw={600} mb={2}>
                  Notes:
                </Text>
                <Text size="sm">{data.notes}</Text>
              </Box>
            )}
          </Stack>
        </Card>

        {/* History Audit Trail */}
        {data.history && data.history.length > 0 && (
          <Card radius="md" withBorder p="lg" mb="md">
            <Title order={5} mb="sm">
              {t('customerStatus.historyTitle')}
            </Title>
            <Stack gap="xs">
              {data.history.map((item, idx) => (
                <Group key={idx} justify="space-between" align="flex-start" style={{ borderBottom: '1px solid var(--mantine-color-gray-2)', paddingBottom: 6 }}>
                  <Box>
                    <Badge size="xs" color={STATUS_CONFIG[item.toStatus]?.color || 'gray'} variant="light">
                      {t(`status.${item.toStatus}`, { defaultValue: item.toStatus })}
                    </Badge>
                    {item.note && (
                      <Text size="xs" c="dimmed" mt={2}>
                        {item.note}
                      </Text>
                    )}
                  </Box>
                  <Text size="xs" c="dimmed">
                    {dayjs(item.changedAt).format('h:mm A, MMM D')}
                  </Text>
                </Group>
              ))}
            </Stack>
          </Card>
        )}

        {/* Footer Live Refresh Banner */}
        <Group justify="center" align="center" gap={6} py="xs">
          <RefreshCw size={12} className="spin" style={{ color: 'var(--mantine-color-dimmed)' }} />
          <Text size="xs" c="dimmed">
            {t('customerStatus.autoRefresh')} {lastRefreshedAt ? `(Updated ${lastRefreshedAt})` : ''}
          </Text>
        </Group>
      </Container>
    </Box>
  )
}

export default CustomerStatusPage
