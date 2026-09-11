import React, { useState } from 'react'
import {
  ActionIcon,
  Button,
  Card,
  Group,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  TextInput
} from '@mantine/core'
import { JobDto, JobStatus } from '@whosonsite/shared'
import { Eye, MapPin, Search, UserCheck, XCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useAppTheme } from '../../app/theme/ThemeContext'
import { formatDateTime } from '../../lib/date/format'
import { ConfirmDialog } from '../common/ConfirmDialog'
import { StatusBadge } from '../common/StatusBadge'
import { ApiErrorAlert } from '../feedback/ApiErrorAlert'
import { AssignTechnicianModal } from './AssignModal'
import { JobDetailDrawer } from './DetailDrawer'
import { useCancelJob, useJobs } from './queries'

export const JobList: React.FC = () => {
  const { t } = useTranslation()
  const { primaryColor } = useAppTheme()

  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Modals & Drawer state
  const [detailDrawerOpened, setDetailDrawerOpened] = useState(false)
  const [selectedJob, setSelectedJob] = useState<JobDto | null>(null)

  const [assignModalOpened, setAssignModalOpened] = useState(false)
  const [assignJobId, setAssignJobId] = useState<string | null>(null)
  const [assignJobTechId, setAssignJobTechId] = useState<string | null>(null)
  const [assignJobTechName, setAssignJobTechName] = useState<string | null>(null)

  const [cancelConfirmOpened, setCancelConfirmOpened] = useState(false)
  const [cancelTargetJobId, setCancelTargetJobId] = useState<string | null>(null)

  const statusFilter =
    selectedStatus !== 'all' && Object.values(JobStatus).includes(selectedStatus as JobStatus)
      ? (selectedStatus as JobStatus)
      : undefined

  const { data: jobs = [], isLoading, error } = useJobs({ status: statusFilter })
  const cancelJobMutation = useCancelJob()

  const filteredJobs = jobs.filter((job) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    const custName = job.customer?.name?.toLowerCase() || ''
    const custAddr = job.customer?.address?.toLowerCase() || ''
    const techName = job.assignedTechnicianName?.toLowerCase() || ''
    const notes = job.notes?.toLowerCase() || ''
    const id = job.id.toLowerCase()
    return (
      custName.includes(q) ||
      custAddr.includes(q) ||
      techName.includes(q) ||
      notes.includes(q) ||
      id.includes(q)
    )
  })

  const handleOpenDetail = (job: JobDto) => {
    setSelectedJob(job)
    setDetailDrawerOpened(true)
  }

  const handleOpenAssign = (
    jobId: string,
    techId?: string | null,
    techName?: string | null,
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation()
    setAssignJobId(jobId)
    setAssignJobTechId(techId || null)
    setAssignJobTechName(techName || null)
    setAssignModalOpened(true)
  }

  const handleOpenCancel = (jobId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setCancelTargetJobId(jobId)
    setCancelConfirmOpened(true)
  }

  const handleConfirmCancel = async () => {
    if (!cancelTargetJobId) return
    try {
      await cancelJobMutation.mutateAsync(cancelTargetJobId)
      setCancelConfirmOpened(false)
      setCancelTargetJobId(null)
    } catch {
      // Handled via cancelJobMutation.error
    }
  }

  const statusOptions = [
    { value: 'all', label: t('jobs.filterAll', 'All Statuses') },
    { value: JobStatus.UNASSIGNED, label: t('status.unassigned', 'Unassigned') },
    { value: JobStatus.ASSIGNED, label: t('status.assigned', 'Assigned') },
    { value: JobStatus.EN_ROUTE, label: t('status.en_route', 'En Route') },
    { value: JobStatus.ON_SITE, label: t('status.on_site', 'On Site') },
    { value: JobStatus.COMPLETE, label: t('status.complete', 'Complete') },
    { value: JobStatus.CANCELLED, label: t('status.cancelled', 'Cancelled') }
  ]

  return (
    <Stack gap="md">
      <ApiErrorAlert error={error} />

      {/* Filter Controls Bar */}
      <Paper p="md" radius="md" withBorder>
        <Group justify="space-between" align="center" wrap="wrap" gap="md">
          <Group gap="md" style={{ flex: 1, minWidth: 280 }}>
            <TextInput
              placeholder={t('common.search', 'Search customer, address, tech, notes...')}
              leftSection={<Search size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, minWidth: 200 }}
            />
            <Select
              data={statusOptions}
              value={selectedStatus}
              onChange={(val) => setSelectedStatus(val || 'all')}
              style={{ width: 180 }}
            />
          </Group>
          <Text size="xs" c="dimmed">
            Showing {filteredJobs.length} of {jobs.length} jobs
          </Text>
        </Group>
      </Paper>

      {/* Jobs List Table */}
      <Card radius="md" withBorder shadow="xs" p="0">
        <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t('jobs.jobId', 'Job ID')}</Table.Th>
              <Table.Th>{t('jobs.customerAddress', 'Customer & Address')}</Table.Th>
              <Table.Th>{t('jobs.status', 'Status')}</Table.Th>
              <Table.Th>{t('jobs.technician', 'Technician')}</Table.Th>
              <Table.Th>{t('jobs.scheduledAt', 'Schedule')}</Table.Th>
              <Table.Th ta="right">{t('common.actions', 'Actions')}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {isLoading ? (
              <Table.Tr>
                <Table.Td colSpan={6} ta="center" py="xl">
                  <Text size="sm" c="dimmed">
                    {t('common.loading', 'Loading jobs...')}
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : filteredJobs.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={6} ta="center" py="xl">
                  <Text size="sm" c="dimmed">
                    {t('common.noData', 'No jobs found matching filters.')}
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              filteredJobs.map((job) => (
                <Table.Tr
                  key={job.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleOpenDetail(job)}
                >
                  <Table.Td>
                    <Text size="xs" fw={700}>
                      {job.id.slice(0, 8)}...
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs" fw={600}>
                      {job.customer?.name || t('jobs.noCustomer', 'Unassigned Customer')}
                    </Text>
                    {job.customer?.address && (
                      <Group gap={4}>
                        <MapPin size={12} style={{ opacity: 0.6 }} />
                        <Text size="xs" c="dimmed" truncate max-width={240}>
                          {job.customer.address}
                        </Text>
                      </Group>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <StatusBadge status={job.status} />
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs" fw={500}>
                      {job.assignedTechnicianName || (
                        <Text span c="dimmed" fs="italic">
                          Unassigned
                        </Text>
                      )}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs" c="dimmed">
                      {formatDateTime(job.scheduledAt)}
                    </Text>
                  </Table.Td>
                  <Table.Td ta="right">
                    <Group justify="flex-end" gap={6} wrap="nowrap">
                      {job.status !== JobStatus.COMPLETE && job.status !== JobStatus.CANCELLED && (
                        <Button
                          size="xs"
                          variant="light"
                          color="indigo"
                          leftSection={<UserCheck size={14} />}
                          onClick={(e) =>
                            handleOpenAssign(
                              job.id,
                              job.assignedTechnicianId,
                              job.assignedTechnicianName,
                              e
                            )
                          }
                        >
                          {job.assignedTechnicianId ? 'Reassign' : 'Assign'}
                        </Button>
                      )}

                      <ActionIcon
                        variant="light"
                        color={primaryColor}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenDetail(job)
                        }}
                      >
                        <Eye size={16} />
                      </ActionIcon>

                      {job.status !== JobStatus.COMPLETE && job.status !== JobStatus.CANCELLED && (
                        <ActionIcon
                          variant="light"
                          color="red"
                          size="sm"
                          onClick={(e) => handleOpenCancel(job.id, e)}
                        >
                          <XCircle size={16} />
                        </ActionIcon>
                      )}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Card>

      <JobDetailDrawer
        opened={detailDrawerOpened}
        onClose={() => {
          setDetailDrawerOpened(false)
          setSelectedJob(null)
        }}
        job={selectedJob}
        onOpenAssignModal={(j) =>
          handleOpenAssign(j.id, j.assignedTechnicianId, j.assignedTechnicianName)
        }
      />

      <AssignTechnicianModal
        opened={assignModalOpened}
        onClose={() => setAssignModalOpened(false)}
        jobId={assignJobId}
        currentTechnicianId={assignJobTechId}
        currentTechnicianName={assignJobTechName}
      />

      <ConfirmDialog
        opened={cancelConfirmOpened}
        onClose={() => setCancelConfirmOpened(false)}
        onConfirm={handleConfirmCancel}
        title={t('jobs.cancelTitle', 'Cancel Job')}
        message={t('jobs.cancelConfirmMessage', 'Are you sure you want to cancel this job?')}
        loading={cancelJobMutation.isPending}
        color="red"
      />
    </Stack>
  )
}
