import React, { useCallback, useMemo, useRef, useState } from 'react'
import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Group,
  Paper,
  Stack,
  Text,
  Title
} from '@mantine/core'
import { JobDto, JobStatus } from '@whosonsite/shared'
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Navigation,
  Phone,
  RotateCw
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useAuth } from '../components/auth/AuthContext'
import { PageHeader } from '../components/common/PageHeader'
import { StatusBadge } from '../components/common/StatusBadge'
import { JobDetailDrawer } from '../components/jobs/DetailDrawer'
import { useJobs, useUpdateJobStatus } from '../components/jobs/queries'
import { useAgents } from '../components/agents/queries'
import { formatDate, formatDateTime } from '../lib/date/format'
import { useLocationTracking } from '../lib/location/useLocationTracking'

interface UnsyncedUpdate {
  jobId: string
  targetStatus: JobStatus
  note?: string
  attempt: number
  errorMsg: string
}

export const AgentJobs: React.FC = () => {
  const { t } = useTranslation()
  const { user } = useAuth()

  const { data: jobs = [], isLoading: isLoadingJobs } = useJobs()
  const { data: agents = [] } = useAgents()
  const updateStatusMutation = useUpdateJobStatus()

  const [detailDrawerJob, setDetailDrawerJob] = useState<JobDto | null>(null)

  // Track failed status transitions for retry-with-backoff (Flow B)
  const [unsyncedQueue, setUnsyncedQueue] = useState<Record<string, UnsyncedUpdate>>({})
  const retryingJobsRef = useRef<Set<string>>(new Set())

  // Find logged-in agent record
  const currentAgent = useMemo(() => {
    return agents.find((t) => t.userId === user?.id)
  }, [agents, user?.id])

  // Check if agent currently has an active job en_route or on_site
  const hasActiveEnRouteOrOnSite = useMemo(() => {
    return jobs.some((j) => j.status === JobStatus.EN_ROUTE || j.status === JobStatus.ON_SITE)
  }, [jobs])

  // Enable live watchPosition GPS tracking when agent is en route or on site
  useLocationTracking(currentAgent?.id || null, hasActiveEnRouteOrOnSite)

  // Execute status update with backoff retry support
  const executeStatusTransition = useCallback(
    async (jobId: string, targetStatus: JobStatus, note?: string, currentAttempt = 0) => {
      if (retryingJobsRef.current.has(jobId)) {
        return
      }
      retryingJobsRef.current.add(jobId)

      try {
        await updateStatusMutation.mutateAsync({
          id: jobId,
          status: targetStatus,
          note
        })

        // Success: Clear unsynced status if present
        setUnsyncedQueue((prev) => {
          const next = { ...prev }
          delete next[jobId]
          return next
        })
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Network sync error. Will retry automatically.'
        const nextAttempt = currentAttempt + 1

        setUnsyncedQueue((prev) => ({
          ...prev,
          [jobId]: {
            jobId,
            targetStatus,
            note,
            attempt: nextAttempt,
            errorMsg
          }
        }))

        // Schedule exponential backoff retry (2s, 4s, 8s, up to 30s)
        const delayMs = Math.min(1000 * Math.pow(2, nextAttempt), 30000)
        setTimeout(() => {
          retryingJobsRef.current.delete(jobId)
          executeStatusTransition(jobId, targetStatus, note, nextAttempt)
        }, delayMs)
      } finally {
        retryingJobsRef.current.delete(jobId)
      }
    },
    [updateStatusMutation]
  )

  const handleManualRetry = (jobId: string) => {
    const item = unsyncedQueue[jobId]
    if (item) {
      executeStatusTransition(item.jobId, item.targetStatus, item.note, item.attempt)
    }
  }

  // Active & Pending Jobs vs Completed Jobs
  const activeQueue = useMemo(() => {
    return jobs.filter(
      (j) => j.status === JobStatus.ASSIGNED || j.status === JobStatus.EN_ROUTE || j.status === JobStatus.ON_SITE
    )
  }, [jobs])

  const completedQueue = useMemo(() => {
    return jobs.filter((j) => j.status === JobStatus.COMPLETE || j.status === JobStatus.CANCELLED)
  }, [jobs])

  return (
    <Container fluid p={0}>
      <Stack gap="sm">
        <PageHeader
          title={t('agent.myJobs', 'My Job Queue')}
          subtitle={t(
            'agent.subtitle',
            'Today’s assigned field jobs and one-tap status updates'
          )}
        />

        {currentAgent && (
          <Paper p="xs" radius="md" withBorder bg="var(--mantine-color-body)">
            <Group justify="space-between" align="center">
              <Group gap="xs">
                <Badge color="teal" variant="dot">
                  Tech Status: {currentAgent.status.toUpperCase()}
                </Badge>
                <Text size="xs" c="dimmed">
                  {currentAgent.name} ({currentAgent.phone})
                </Text>
              </Group>
              {hasActiveEnRouteOrOnSite && (
                <Badge color="blue" variant="filled" size="xs">
                  GPS Tracking Active
                </Badge>
              )}
            </Group>
          </Paper>
        )}

        {/* Unsynced Queue Notice Banner */}
        {Object.keys(unsyncedQueue).length > 0 && (
          <Alert color="red" icon={<AlertCircle size={18} />} title="Unsynced Updates Pending">
            <Text size="xs" mb="xs">
              Some status updates could not be sent to the server. Automatic retries are active in the background.
            </Text>
          </Alert>
        )}

        {/* Active Queue Section */}
        <div>
          <Title order={4} mb="xs">
            {t('agent.activeQueue', 'Active Jobs')} ({activeQueue.length})
          </Title>

          {isLoadingJobs ? (
            <Text size="sm" c="dimmed">
              {t('common.loading', 'Loading jobs...')}
            </Text>
          ) : activeQueue.length === 0 ? (
            <Paper p="xl" radius="md" withBorder ta="center">
              <Text size="sm" c="dimmed">
                🎉 {t('agent.noActiveJobs', 'No active jobs in your queue right now.')}
              </Text>
            </Paper>
          ) : (
            <Stack gap="sm">
              {activeQueue.map((job) => {
                const unsynced = unsyncedQueue[job.id]

                return (
                  <Card key={job.id} withBorder radius="md" p="md" shadow="xs">
                    <Stack gap="xs">
                      <Group justify="space-between" align="center">
                        <Group gap="xs">
                          <StatusBadge status={job.status} />
                          {unsynced && (
                            <Badge color="red" variant="filled" size="xs" leftSection={<AlertCircle size={10} />}>
                              Not Synced (Attempt #{unsynced.attempt})
                            </Badge>
                          )}
                        </Group>
                        <Button
                          size="xs"
                          variant="subtle"
                          onClick={() => setDetailDrawerJob(job)}
                        >
                          {t('common.details', 'Details')}
                        </Button>
                      </Group>

                      <Text fw={700} size="md">
                        {job.customer?.name || 'Customer'}
                      </Text>

                      {job.customer?.address && (
                        <Group gap={6}>
                          <MapPin size={16} style={{ color: 'gray', flexShrink: 0 }} />
                          <Text size="xs" c="dimmed">
                            {job.customer.address}
                          </Text>
                        </Group>
                      )}

                      {job.customer?.mobile && (
                        <Group gap={6}>
                          <Phone size={16} style={{ color: 'gray', flexShrink: 0 }} />
                          <Text size="xs" c="dimmed">
                            {job.customer.mobile}
                          </Text>
                        </Group>
                      )}

                      <Group justify="space-between" mt={2}>
                        <Group gap={6}>
                          <Calendar size={14} style={{ color: 'gray' }} />
                          <Text size="xs" c="dimmed">
                            {formatDateTime(job.scheduledAt)}
                          </Text>
                        </Group>

                        <Group gap={6}>
                          <Clock size={14} style={{ color: 'gray' }} />
                          <Text size="xs" c="dimmed">
                            Created {formatDate(job.createdAt)}
                          </Text>
                        </Group>
                      </Group>

                      {job.notes && (
                        <Paper p="xs" bg="var(--mantine-color-body)" withBorder radius="xs">
                          <Text size="xs" c="dimmed" fs="italic">
                            Notes: {job.notes}
                          </Text>
                        </Paper>
                      )}

                      {/* Unsynced Retry Control */}
                      {unsynced && (
                        <Alert color="red" p="xs">
                          <Group justify="space-between" align="center">
                            <Text size="xs">
                              Target: <strong>{unsynced.targetStatus.toUpperCase()}</strong> ({unsynced.errorMsg})
                            </Text>
                            <Button
                              size="xs"
                              color="red"
                              variant="light"
                              leftSection={<RotateCw size={12} />}
                              onClick={() => handleManualRetry(job.id)}
                            >
                              Retry Sync
                            </Button>
                          </Group>
                        </Alert>
                      )}

                      {/* One-Tap Action Buttons */}
                      <Group justify="stretch" mt="xs">
                        {job.status === JobStatus.ASSIGNED && (
                          <Button
                            fullWidth
                            color="blue"
                            size="md"
                            leftSection={<Navigation size={18} />}
                            loading={updateStatusMutation.isPending && !unsynced}
                            onClick={() => executeStatusTransition(job.id, JobStatus.EN_ROUTE)}
                          >
                            {t('agent.startEnRoute', 'Start En Route')}
                          </Button>
                        )}

                        {job.status === JobStatus.EN_ROUTE && (
                          <Button
                            fullWidth
                            color="teal"
                            size="md"
                            leftSection={<MapPin size={18} />}
                            loading={updateStatusMutation.isPending && !unsynced}
                            onClick={() => executeStatusTransition(job.id, JobStatus.ON_SITE)}
                          >
                            {t('agent.arriveOnSite', 'Arrive On Site')}
                          </Button>
                        )}

                        {job.status === JobStatus.ON_SITE && (
                          <Button
                            fullWidth
                            color="green"
                            size="md"
                            leftSection={<CheckCircle2 size={18} />}
                            loading={updateStatusMutation.isPending && !unsynced}
                            onClick={() => executeStatusTransition(job.id, JobStatus.COMPLETE)}
                          >
                            {t('agent.completeJob', 'Complete Job')}
                          </Button>
                        )}
                      </Group>
                    </Stack>
                  </Card>
                )
              })}
            </Stack>
          )}
        </div>

        {/* Completed Jobs History Section */}
        {completedQueue.length > 0 && (
          <div>
            <Title order={4} mb="xs" c="dimmed">
              {t('agent.completedQueue', 'Completed & History')} ({completedQueue.length})
            </Title>
            <Stack gap="xs">
              {completedQueue.map((job) => (
                <Card key={job.id} withBorder radius="md" p="sm" style={{ opacity: 0.85 }}>
                  <Group justify="space-between" align="center">
                    <Group gap="xs">
                      <StatusBadge status={job.status} />
                      <Text fw={600} size="sm">
                        {job.customer?.name || 'Customer'}
                      </Text>
                    </Group>
                    <Button
                      size="xs"
                      variant="subtle"
                      onClick={() => setDetailDrawerJob(job)}
                    >
                      {t('common.details', 'Details')}
                    </Button>
                  </Group>
                </Card>
              ))}
            </Stack>
          </div>
        )}

        {/* Reused Job Detail Drawer */}
        <JobDetailDrawer
          opened={Boolean(detailDrawerJob)}
          onClose={() => setDetailDrawerJob(null)}
          job={detailDrawerJob}
          onOpenAssignModal={() => {}}
        />
      </Stack>
    </Container>
  )
}

export default AgentJobs
