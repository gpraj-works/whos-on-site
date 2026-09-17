import React, { useEffect, useState } from 'react'
import {
  Badge,
  Button,
  Card,
  Divider,
  Drawer,
  Group,
  Paper,
  Stack,
  Text,
  Textarea,
  Timeline,
  Title
} from '@mantine/core'
import { JobDto, JobStatus } from '@whosonsite/shared'
import {
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  MapPin,
  MessageSquare,
  Navigation,
  Share2,
  UserCheck,
  XCircle
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { formatDate, formatDateTime, formatRelative } from '@whosonsite/shared'
import { ConfirmDialog } from '../common/ConfirmDialog'
import { StatusBadge } from '../common/StatusBadge'
import { ApiErrorAlert } from '../feedback/ApiErrorAlert'
import { useCancelJob, useJob, useJobHistory, useUpdateJobStatus } from './queries'

interface JobDetailDrawerProps {
  opened: boolean
  onClose: () => void
  job: JobDto | null
  onOpenAssignModal: (job: JobDto) => void
}

export const JobDetailDrawer: React.FC<JobDetailDrawerProps> = ({
  opened,
  onClose,
  job,
  onOpenAssignModal
}) => {
  const { t } = useTranslation()
  const { data: fetchedJob } = useJob(opened ? job?.id : null)
  const currentJob = fetchedJob || job

  const { data: history = [], isLoading: isLoadingHistory } = useJobHistory(currentJob?.id)
  const updateStatusMutation = useUpdateJobStatus()
  const cancelJobMutation = useCancelJob()

  const [confirmCancelOpened, setConfirmCancelOpened] = useState(false)
  const [statusNote, setStatusNote] = useState('')
  const [showNoteInput, setShowNoteInput] = useState<JobStatus | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setShowNoteInput(null)
    setStatusNote('')
  }, [currentJob?.id, currentJob?.status])

  if (!currentJob) return null

  const handleCopyShareLink = () => {
    if (!currentJob.shareToken) return
    const shareUrl = `${window.location.origin}/status/${currentJob.shareToken}`
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const submitStatusChange = async (nextStatus: JobStatus) => {
    if (!currentJob || currentJob.status === JobStatus.COMPLETE || currentJob.status === JobStatus.CANCELLED) {
      return
    }

    try {
      await updateStatusMutation.mutateAsync({
        id: currentJob.id,
        status: nextStatus,
        note: statusNote.trim() || undefined
      })
      setShowNoteInput(null)
      setStatusNote('')
    } catch {
      // Error handled via updateStatusMutation.error
    }
  }

  const handleStatusTransition = (nextStatus: JobStatus) => {
    if (!currentJob || currentJob.status === JobStatus.COMPLETE || currentJob.status === JobStatus.CANCELLED) {
      return
    }
    if (showNoteInput === nextStatus) {
      setShowNoteInput(null)
    } else {
      setShowNoteInput(nextStatus)
    }
  }

  const handleConfirmCancel = async () => {
    try {
      await cancelJobMutation.mutateAsync(currentJob.id)
      setConfirmCancelOpened(false)
    } catch {
      // Error handled via cancelJobMutation.error
    }
  }

  const renderStatusActionButtons = () => {
    if (currentJob.status === JobStatus.CANCELLED || currentJob.status === JobStatus.COMPLETE) {
      return (
        <Text size="xs" c="dimmed" fs="italic">
          {t('jobs.terminalStateNotice', 'This job is in a terminal state.')}
        </Text>
      )
    }

    return (
      <Stack gap="xs">
        <Text size="xs" fw={700} tt="uppercase" c="dimmed">
          {t('jobs.availableActions', 'Available Status Actions')}
        </Text>

        <Group gap="xs">
          {currentJob.status === JobStatus.UNASSIGNED && (
            <Button
              size="xs"
              color="indigo"
              leftSection={<UserCheck size={14} />}
              onClick={() => onOpenAssignModal(currentJob)}
            >
              {t('jobs.assignAgent', 'Assign Agent')}
            </Button>
          )}

          {currentJob.status === JobStatus.ASSIGNED && (
            <>
              <Button
                size="xs"
                color="blue"
                leftSection={<Navigation size={14} />}
                loading={updateStatusMutation.isPending && showNoteInput === JobStatus.EN_ROUTE}
                onClick={() => handleStatusTransition(JobStatus.EN_ROUTE)}
              >
                {t('jobs.markEnRoute', 'Start En Route')}
              </Button>
              <Button
                size="xs"
                variant="light"
                color="indigo"
                onClick={() => onOpenAssignModal(currentJob)}
              >
                {t('jobs.reassignAgent', 'Reassign Agent')}
              </Button>
            </>
          )}

          {currentJob.status === JobStatus.EN_ROUTE && (
            <Button
              size="xs"
              color="teal"
              leftSection={<MapPin size={14} />}
              loading={updateStatusMutation.isPending && showNoteInput === JobStatus.ON_SITE}
              onClick={() => handleStatusTransition(JobStatus.ON_SITE)}
            >
              {t('jobs.markOnSite', 'Arrive On Site')}
            </Button>
          )}

          {currentJob.status === JobStatus.ON_SITE && (
            <Button
              size="xs"
              color="green"
              leftSection={<CheckCircle2 size={14} />}
              loading={updateStatusMutation.isPending && showNoteInput === JobStatus.COMPLETE}
              onClick={() => handleStatusTransition(JobStatus.COMPLETE)}
            >
              {t('jobs.markComplete', 'Complete Job')}
            </Button>
          )}

          <Button
            size="xs"
            color="red"
            variant="light"
            leftSection={<XCircle size={14} />}
            onClick={() => setConfirmCancelOpened(true)}
          >
            {t('jobs.cancelJob', 'Cancel Job')}
          </Button>
        </Group>

        {showNoteInput && (
          <Paper p="xs" withBorder bg="var(--mantine-color-body)">
            <Text size="xs" fw={600} mb={4}>
              {t('jobs.addStatusNote', 'Add optional note for status change:')}
            </Text>
            <Textarea
              placeholder={t('jobs.notePlaceholder', 'e.g. Delayed due to traffic')}
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              rows={2}
              mb="xs"
            />
            <Group justify="flex-end" gap="xs">
              <Button size="xs" variant="default" onClick={() => setShowNoteInput(null)}>
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button
                size="xs"
                loading={updateStatusMutation.isPending}
                disabled={!showNoteInput}
                onClick={() => {
                  if (showNoteInput) {
                    submitStatusChange(showNoteInput)
                  }
                }}
              >
                {t('common.update', 'Update')}
              </Button>
            </Group>
          </Paper>
        )}
      </Stack>
    )
  }

  return (
    <>
      <Drawer
        opened={opened}
        onClose={onClose}
        zIndex={1000}
        title={
          <Group gap="xs">
            <Text fw={700} size="lg">
              {currentJob.id.slice(0, 8)}...
            </Text>
            <StatusBadge status={currentJob.status} />
          </Group>
        }
        position="right"
        size="lg"
      >
        <Stack gap="md" p="xs">
          <ApiErrorAlert error={updateStatusMutation.error || cancelJobMutation.error} />

          {/* Customer & Job Info Card */}
          <Card withBorder radius="md" p="md">
            <Stack gap="xs">
              <Group justify="space-between" align="flex-start">
                <div>
                  <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                    {t('jobs.customer', 'Customer')}
                  </Text>
                  <Text fw={700} size="md">
                    {currentJob.customer?.name || t('jobs.noCustomer', 'Unknown Customer')}
                  </Text>
                </div>
                <Group gap="xs">
                  {currentJob.assignedAgentName && (
                    <Badge variant="light" color="blue" size="md">
                      Agent: {currentJob.assignedAgentName}
                    </Badge>
                  )}
                  {currentJob.shareToken && (
                    <Button
                      size="xs"
                      variant="light"
                      color={copied ? 'teal' : 'gray'}
                      leftSection={copied ? <Check size={14} /> : <Share2 size={14} />}
                      onClick={handleCopyShareLink}
                    >
                      {copied ? t('jobs.linkCopied', 'Copied') : t('jobs.copyShareLink', 'Copy Share Link')}
                    </Button>
                  )}
                </Group>
              </Group>

              {currentJob.customer?.address && (
                <Group gap={6}>
                  <MapPin size={16} style={{ color: 'gray' }} />
                  <Text size="sm">{currentJob.customer.address}</Text>
                </Group>
              )}

              {currentJob.customer?.mobile && (
                <Group gap={6}>
                  <Text size="xs" c="dimmed">
                    Phone: {currentJob.customer.mobile}
                  </Text>
                </Group>
              )}

              <Divider my="xs" />

              <Group justify="space-between">
                <Group gap={6}>
                  <Calendar size={16} style={{ color: 'gray' }} />
                  <div>
                    <Text size="xs" c="dimmed">
                      {t('jobs.scheduledFor', 'Scheduled For')}
                    </Text>
                    <Text size="xs" fw={600}>
                      {formatDateTime(currentJob.scheduledAt)}
                    </Text>
                  </div>
                </Group>

                <Group gap={6}>
                  <Clock size={16} style={{ color: 'gray' }} />
                  <div>
                    <Text size="xs" c="dimmed">
                      {t('jobs.createdAt', 'Created')}
                    </Text>
                    <Text size="xs" fw={600}>
                      {formatDate(currentJob.createdAt)}
                    </Text>
                  </div>
                </Group>
              </Group>

              {currentJob.notes && (
                <Paper p="xs" bg="var(--mantine-color-body)" withBorder mt="xs">
                  <Text size="xs" fw={600} c="dimmed" mb={2}>
                    {t('jobs.notes', 'Description')}
                  </Text>
                  <Text size="xs">{currentJob.notes}</Text>
                </Paper>
              )}
            </Stack>
          </Card>

          {/* Transition Action Buttons */}
          <Paper p="md" withBorder radius="md">
            {renderStatusActionButtons()}
          </Paper>

          {/* Audit Status History Timeline */}
          <Card withBorder radius="md" p="md">
            <Title order={5} mb="md">
              {t('jobs.statusHistory', 'Status Audit Trail')}
            </Title>

            {isLoadingHistory ? (
              <Text size="xs" c="dimmed">
                {t('common.loading', 'Loading history...')}
              </Text>
            ) : history.length === 0 ? (
              <Text size="xs" c="dimmed">
                {t('jobs.noHistory', 'No status changes recorded yet.')}
              </Text>
            ) : (
              <Timeline active={history.length - 1} bulletSize={22} lineWidth={2}>
                {history.map((item) => (
                  <Timeline.Item
                    key={item.id}
                    title={
                      <Group gap="xs">
                        <StatusBadge status={item.toStatus} />
                        {item.fromStatus && (
                          <Text size="xs" c="dimmed">
                            (from {item.fromStatus})
                          </Text>
                        )}
                      </Group>
                    }
                  >
                    <Text size="xs" c="dimmed" mt={2}>
                      By {item.changedByName || item.changedBy || 'System'} •{' '}
                      {formatRelative(item.changedAt)} ({formatDateTime(item.changedAt)})
                    </Text>
                    {item.note && (
                      <Paper p="xs" bg="var(--mantine-color-body)" withBorder mt={4}>
                        <Group gap={4}>
                          <MessageSquare size={12} />
                          <Text size="xs" fs="italic">
                            {item.note}
                          </Text>
                        </Group>
                      </Paper>
                    )}
                  </Timeline.Item>
                ))}
              </Timeline>
            )}
          </Card>
        </Stack>
      </Drawer>

      <ConfirmDialog
        opened={confirmCancelOpened}
        onClose={() => setConfirmCancelOpened(false)}
        onConfirm={handleConfirmCancel}
        title={t('jobs.cancelTitle', 'Cancel Job')}
        message={t(
          'jobs.cancelConfirmMessage',
          'Are you sure you want to cancel this job? This will update status to Cancelled.'
        )}
        loading={cancelJobMutation.isPending}
        color="red"
      />
    </>
  )
}
