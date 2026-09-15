import React, { useMemo, useState } from 'react'
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Flex,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  Tooltip
} from '@mantine/core'
import { JobDto, JobStatus } from '@whosonsite/shared'
import { MapPin, Navigation, Plus, Search, UserCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { JOB_STATUS_COLORS, useAppTheme } from '../app/theme'
import { PageHeader } from '../components/common/PageHeader'
import { StatusBadge } from '../components/common/StatusBadge'
import { JobMap } from '../components/jobs/JobMap'
import { AssignAgentModal } from '../components/jobs/AssignModal'
import { JobDetailDrawer } from '../components/jobs/DetailDrawer'
import { CreateJobModal } from '../components/jobs/Form'
import { useJobs } from '../components/jobs/queries'
import { useAgents } from '../components/agents/queries'
import { formatDateTime } from '../lib/date/format'

export const Jobs: React.FC = () => {
  const { t } = useTranslation()
  const { primaryColor } = useAppTheme()

  const { data: jobs = [], isLoading: isLoadingJobs } = useJobs()
  const { data: agents = [] } = useAgents()

  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)

  const [createModalOpened, setCreateModalOpened] = useState(false)
  const [assignModalJob, setAssignModalJob] = useState<JobDto | null>(null)
  const [detailDrawerJob, setDetailDrawerJob] = useState<JobDto | null>(null)

  // Filter jobs based on selected status and search query
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesStatus =
        statusFilter === 'ALL'
          ? true
          : statusFilter === 'ACTIVE'
          ? job.status === JobStatus.ASSIGNED ||
            job.status === JobStatus.EN_ROUTE ||
            job.status === JobStatus.ON_SITE
          : job.status === statusFilter

      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        job.id.toLowerCase().includes(q) ||
        job.customer?.name.toLowerCase().includes(q) ||
        job.customer?.address.toLowerCase().includes(q) ||
        (job.assignedAgentName && job.assignedAgentName.toLowerCase().includes(q)) ||
        (job.notes && job.notes.toLowerCase().includes(q))

      return matchesStatus && matchesSearch
    })
  }, [jobs, statusFilter, searchQuery])

  // Count summaries
  const counts = useMemo(() => {
    return {
      all: jobs.length,
      unassigned: jobs.filter((j) => j.status === JobStatus.UNASSIGNED).length,
      inProgress: jobs.filter(
        (j) => j.status === JobStatus.ASSIGNED || j.status === JobStatus.EN_ROUTE || j.status === JobStatus.ON_SITE
      ).length,
      complete: jobs.filter((j) => j.status === JobStatus.COMPLETE).length
    }
  }, [jobs])

  return (
    <Container fluid p={0} style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
      <Stack gap="sm" style={{ height: '100%' }}>
        <PageHeader
          title={t('jobs.title', 'Jobs')}
          subtitle={t(
            'jobs.subtitle',
            'Manage job assignments, status, and tracking'
          )}
          actions={
            <Button
              leftSection={<Plus size={16} />}
              color={primaryColor}
              onClick={() => setCreateModalOpened(true)}
            >
              {t('common.new', 'New')}
            </Button>
          }
        />

        <Flex direction={{ base: 'column', md: 'row' }} style={{ flex: 1, minHeight: 0 }} gap="sm">
          {/* Left Column: Job Board & Filters */}
          <Paper
            w={{ base: '100%', md: '40%', lg: '33%' }}
            radius="md"
            p="sm"
            withBorder
            style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}
          >
              <Stack gap="xs" mb="sm">
                <TextInput
                  placeholder={t('dispatch.searchPlaceholder', 'Search customer, address, tech...')}
                  leftSection={<Search size={16} />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="xs"
                />

                <ScrollArea type="never" style={{ width: '100%' }}>
                  <Group gap={4} wrap="nowrap" style={{ width: '100%' }}>
                    <Button
                      size="compact-xs"
                      radius="md"
                      variant={statusFilter === 'ALL' ? 'filled' : 'light'}
                      color="gray"
                      onClick={() => setStatusFilter('ALL')}
                      style={{ flex: 1, minWidth: 'max-content' }}
                    >
                      All ({counts.all})
                    </Button>
                    <Button
                      size="compact-xs"
                      radius="md"
                      variant={statusFilter === JobStatus.UNASSIGNED ? 'filled' : 'light'}
                      color={JOB_STATUS_COLORS[JobStatus.UNASSIGNED]}
                      onClick={() => setStatusFilter(JobStatus.UNASSIGNED)}
                      style={{ flex: 1, minWidth: 'max-content' }}
                    >
                      Unassigned ({counts.unassigned})
                    </Button>
                    <Button
                      size="compact-xs"
                      radius="md"
                      variant={statusFilter === 'ACTIVE' ? 'filled' : 'light'}
                      color={JOB_STATUS_COLORS[JobStatus.ASSIGNED]}
                      onClick={() => setStatusFilter('ACTIVE')}
                      style={{ flex: 1, minWidth: 'max-content' }}
                    >
                      Active ({counts.inProgress})
                    </Button>
                    <Button
                      size="compact-xs"
                      radius="md"
                      variant={statusFilter === JobStatus.COMPLETE ? 'filled' : 'light'}
                      color={JOB_STATUS_COLORS[JobStatus.COMPLETE]}
                      onClick={() => setStatusFilter(JobStatus.COMPLETE)}
                      style={{ flex: 1, minWidth: 'max-content' }}
                    >
                      Done ({counts.complete})
                    </Button>
                  </Group>
                </ScrollArea>
              </Stack>

              {/* Job List Cards */}
              <ScrollArea style={{ flex: 1 }} scrollbars="y">
                {isLoadingJobs ? (
                  <Text size="xs" c="dimmed" ta="center" py="xl">
                    {t('common.loading', 'Loading jobs...')}
                  </Text>
                ) : filteredJobs.length === 0 ? (
                  <Text size="xs" c="dimmed" ta="center" py="xl">
                    {t('dispatch.noJobsFound', 'No jobs match the current filters.')}
                  </Text>
                ) : (
                  <Stack gap="xs">
                    {filteredJobs.map((job) => {
                      const isSelected = selectedJobId === job.id
                      const hasLocation = Boolean(job.location)

                      return (
                        <Card
                          key={job.id}
                          withBorder
                          padding="xs"
                          radius="md"
                          style={{
                            cursor: 'pointer',
                            borderColor: isSelected ? 'var(--mantine-color-blue-6)' : undefined,
                            backgroundColor: isSelected ? 'var(--mantine-color-blue-0)' : undefined
                          }}
                          onClick={() => {
                            setSelectedJobId(job.id)
                            setSelectedAgentId(null)
                          }}
                        >
                          <Stack gap={4}>
                            <Group justify="space-between" align="center">
                              <StatusBadge status={job.status} />
                              <Group gap={4}>
                                {hasLocation && (
                                  <Tooltip label={t('dispatch.focusOnMap', 'Focus on Map')}>
                                    <ActionIcon
                                      size="xs"
                                      variant="subtle"
                                      color="blue"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setSelectedJobId(job.id)
                                        setSelectedAgentId(null)
                                      }}
                                    >
                                      <Navigation size={14} />
                                    </ActionIcon>
                                  </Tooltip>
                                )}
                                <Button
                                  size="xs"
                                  variant="subtle"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setDetailDrawerJob(job)
                                  }}
                                >
                                  {t('common.details', 'Details')}
                                </Button>
                              </Group>
                            </Group>

                            <Text fw={600} size="sm" lineClamp={1}>
                              {job.customer?.name || t('jobs.noCustomer', 'Unknown Customer')}
                            </Text>

                            {job.customer?.address && (
                              <Group gap={4} wrap="nowrap">
                                <MapPin size={12} style={{ flexShrink: 0, color: 'gray' }} />
                                <Text size="xs" c="dimmed" lineClamp={1}>
                                  {job.customer.address}
                                </Text>
                              </Group>
                            )}

                            <Group justify="space-between" align="center" mt={4}>
                              {job.assignedAgentName ? (
                                <Badge size="xs" variant="light" color="indigo">
                                  {job.assignedAgentName}
                                </Badge>
                              ) : (
                                <Badge size="xs" variant="light" color="orange">
                                  Unassigned
                                </Badge>
                              )}

                              <Text size="xs" c="dimmed">
                                {formatDateTime(job.scheduledAt || job.createdAt)}
                              </Text>
                            </Group>

                            {job.status === JobStatus.UNASSIGNED && (
                              <Button
                                size="xs"
                                variant="light"
                                color="teal"
                                fullWidth
                                mt={4}
                                leftSection={<UserCheck size={12} />}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setAssignModalJob(job)
                                }}
                              >
                                {t('jobs.assign', 'Assign Agent')}
                              </Button>
                            )}
                          </Stack>
                        </Card>
                      )
                    })}
                  </Stack>
                )}
              </ScrollArea>
            </Paper>

          {/* Right Column: Live Leaflet Map */}
          <Box style={{ flex: 1, height: '100%', minHeight: '300px' }}>
            <JobMap
              jobs={jobs}
              agents={agents}
              selectedJobId={selectedJobId}
              selectedAgentId={selectedAgentId}
              onSelectJob={(job) => {
                setSelectedJobId(job.id)
                setSelectedAgentId(null)
              }}
              onSelectAgent={(tech) => {
                setSelectedAgentId(tech.id)
                setSelectedJobId(null)
              }}
              onAssignJob={(job) => setAssignModalJob(job)}
            />
          </Box>
        </Flex>

        {/* Modals & Drawers */}
        <CreateJobModal opened={createModalOpened} onClose={() => setCreateModalOpened(false)} />

        <AssignAgentModal
          opened={Boolean(assignModalJob)}
          onClose={() => setAssignModalJob(null)}
          jobId={assignModalJob?.id || null}
          currentAgentId={assignModalJob?.assignedAgentId}
          currentAgentName={assignModalJob?.assignedAgentName}
        />

        <JobDetailDrawer
          opened={Boolean(detailDrawerJob)}
          onClose={() => setDetailDrawerJob(null)}
          job={detailDrawerJob}
          onOpenAssignModal={(j) => {
            setDetailDrawerJob(null)
            setAssignModalJob(j)
          }}
        />
      </Stack>
    </Container>
  )
}

export default Jobs
