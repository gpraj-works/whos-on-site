import React, { useMemo, useState } from 'react'
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Paper,
  ScrollArea,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  Tooltip
} from '@mantine/core'
import { JobDto, JobStatus } from '@whosonsite/shared'
import { MapPin, Navigation, Plus, RefreshCw, Search, UserCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useAppTheme } from '../app/theme/ThemeContext'
import { PageHeader } from '../components/common/PageHeader'
import { StatusBadge } from '../components/common/StatusBadge'
import { DispatchMap } from '../components/dispatch/DispatchMap'
import { AssignTechnicianModal } from '../components/jobs/AssignModal'
import { JobDetailDrawer } from '../components/jobs/DetailDrawer'
import { CreateJobModal } from '../components/jobs/Form'
import { useJobs } from '../components/jobs/queries'
import { useTechnicians } from '../components/technicians/queries'
import { formatDateTime } from '../lib/date/format'

export const Dispatch: React.FC = () => {
  const { t } = useTranslation()
  const { primaryColor } = useAppTheme()

  const { data: jobs = [], refetch: refetchJobs, isLoading: isLoadingJobs } = useJobs()
  const { data: technicians = [], refetch: refetchTechs } = useTechnicians()

  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string | null>(null)

  const [createModalOpened, setCreateModalOpened] = useState(false)
  const [assignModalJob, setAssignModalJob] = useState<JobDto | null>(null)
  const [detailDrawerJob, setDetailDrawerJob] = useState<JobDto | null>(null)

  const handleRefresh = () => {
    refetchJobs()
    refetchTechs()
  }

  // Filter jobs based on selected status and search query
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesStatus = statusFilter === 'ALL' || job.status === statusFilter

      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        job.id.toLowerCase().includes(q) ||
        job.customer?.name.toLowerCase().includes(q) ||
        job.customer?.address.toLowerCase().includes(q) ||
        (job.assignedTechnicianName && job.assignedTechnicianName.toLowerCase().includes(q)) ||
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
          title={t('dispatch.title', 'Live Dispatch Board')}
          subtitle={t(
            'dispatch.subtitle',
            'Real-time spatial job tracking, technician dispatching, and status monitoring'
          )}
          actions={
            <Group gap="xs">
              <Button
                variant="default"
                leftSection={<RefreshCw size={16} />}
                onClick={handleRefresh}
              >
                {t('common.refresh', 'Refresh')}
              </Button>
              <Button
                leftSection={<Plus size={16} />}
                color={primaryColor}
                onClick={() => setCreateModalOpened(true)}
              >
                {t('common.newJob', 'New Job')}
              </Button>
            </Group>
          }
        />

        <Grid style={{ flex: 1, minHeight: 0 }} gutter="sm">
          {/* Left Column: Job Board & Filters */}
          <Grid.Col span={{ base: 12, md: 5, lg: 4 }} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Paper radius="md" p="sm" withBorder style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
              <Stack gap="xs" mb="sm">
                <TextInput
                  placeholder={t('dispatch.searchPlaceholder', 'Search customer, address, tech...')}
                  leftSection={<Search size={16} />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="xs"
                />

                <ScrollArea type="never" style={{ width: '100%' }}>
                  <SegmentedControl
                    size="xs"
                    fullWidth
                    value={statusFilter}
                    onChange={setStatusFilter}
                    data={[
                      { label: `All (${counts.all})`, value: 'ALL' },
                      { label: `Unassigned (${counts.unassigned})`, value: JobStatus.UNASSIGNED },
                      { label: `Active (${counts.inProgress})`, value: JobStatus.ASSIGNED },
                      { label: `Done (${counts.complete})`, value: JobStatus.COMPLETE }
                    ]}
                  />
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
                            setSelectedTechnicianId(null)
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
                                        setSelectedTechnicianId(null)
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
                              {job.assignedTechnicianName ? (
                                <Badge size="xs" variant="light" color="indigo">
                                  {job.assignedTechnicianName}
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
                                {t('jobs.assign', 'Assign Technician')}
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
          </Grid.Col>

          {/* Right Column: Live Leaflet Map */}
          <Grid.Col span={{ base: 12, md: 7, lg: 8 }} style={{ height: '100%' }}>
            <DispatchMap
              jobs={jobs}
              technicians={technicians}
              selectedJobId={selectedJobId}
              selectedTechnicianId={selectedTechnicianId}
              onSelectJob={(job) => {
                setSelectedJobId(job.id)
                setSelectedTechnicianId(null)
              }}
              onSelectTechnician={(tech) => {
                setSelectedTechnicianId(tech.id)
                setSelectedJobId(null)
              }}
              onAssignJob={(job) => setAssignModalJob(job)}
            />
          </Grid.Col>
        </Grid>

        {/* Modals & Drawers */}
        <CreateJobModal opened={createModalOpened} onClose={() => setCreateModalOpened(false)} />

        <AssignTechnicianModal
          opened={Boolean(assignModalJob)}
          onClose={() => setAssignModalJob(null)}
          jobId={assignModalJob?.id || null}
          currentTechnicianId={assignModalJob?.assignedTechnicianId}
          currentTechnicianName={assignModalJob?.assignedTechnicianName}
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

export default Dispatch
