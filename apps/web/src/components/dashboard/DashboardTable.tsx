import React from 'react'
import { Button, Card, Group, Table, Text, Title } from '@mantine/core'
import { JobDto } from '@whosonsite/shared'
import { MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { useAppTheme } from '../../app/theme/ThemeContext'
import { formatDateTime } from '../../lib/date/format'
import { StatusBadge } from '../common/StatusBadge'

export type DashboardColumn = 'id' | 'customer' | 'status' | 'agent' | 'scheduledAt'

interface DashboardTableProps {
  title: string
  subtitle?: string
  jobs: JobDto[]
  columns?: DashboardColumn[]
  loading?: boolean
  emptyMessage?: string
  viewAllTo?: string
  viewAllLabel?: string
}

const DEFAULT_COLUMNS: DashboardColumn[] = ['id', 'customer', 'status', 'agent', 'scheduledAt']

export const DashboardTable: React.FC<DashboardTableProps> = ({
  title,
  subtitle,
  jobs,
  columns = DEFAULT_COLUMNS,
  loading = false,
  emptyMessage,
  viewAllTo,
  viewAllLabel
}) => {
  const { t } = useTranslation()
  const { primaryColor } = useAppTheme()

  const colSpan = columns.length

  const headings: Record<DashboardColumn, string> = {
    id: t('jobs.jobId', 'Job ID'),
    customer: t('jobs.customerAddress', 'Customer & Address'),
    status: t('jobs.status', 'Status'),
    agent: t('jobs.agent', 'Agent'),
    scheduledAt: t('jobs.scheduledFor', 'Scheduled At')
  }

  return (
    <Card radius="md" withBorder shadow="xs" p="md">
      <Group justify="space-between" mb="md">
        <div>
          <Title order={4}>{title}</Title>
          {subtitle && (
            <Text size="xs" c="dimmed">
              {subtitle}
            </Text>
          )}
        </div>
        {viewAllTo && (
          <Button size="xs" variant="subtle" color={primaryColor} component={Link} to={viewAllTo}>
            {viewAllLabel || t('common.actions', 'View All')}
          </Button>
        )}
      </Group>

      <Table highlightOnHover verticalSpacing="sm">
        <Table.Thead>
          <Table.Tr>
            {columns.map((col) => (
              <Table.Th key={col} hiddenFrom={col === 'agent' || col === 'scheduledAt' ? 'sm' : undefined}>
                {headings[col]}
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {loading ? (
            <Table.Tr>
              <Table.Td colSpan={colSpan} ta="center" py="lg">
                <Text size="xs" c="dimmed">
                  {t('common.loading', 'Loading jobs...')}
                </Text>
              </Table.Td>
            </Table.Tr>
          ) : jobs.length === 0 ? (
            <Table.Tr>
              <Table.Td colSpan={colSpan} ta="center" py="lg">
                <Text size="xs" c="dimmed">
                  {emptyMessage || t('common.noData', 'No records found')}
                </Text>
              </Table.Td>
            </Table.Tr>
          ) : (
            jobs.map((job) => (
              <Table.Tr key={job.id}>
                {columns.map((col) => (
                  <Table.Td
                    key={col}
                    hiddenFrom={col === 'agent' || col === 'scheduledAt' ? 'sm' : undefined}
                  >
                    {col === 'id' && (
                      <Text size="xs" fw={700}>
                        {job.id.slice(0, 8)}...
                      </Text>
                    )}
                    {col === 'customer' && (
                      <>
                        <Text size="xs" fw={600} truncate maw={180}>
                          {job.customer?.name || t('jobs.noCustomer', 'Assigned Customer')}
                        </Text>
                        {job.customer?.address && (
                          <Group gap={4} wrap="nowrap">
                            <MapPin size={12} style={{ opacity: 0.6, flexShrink: 0 }} />
                            <Text size="xs" c="dimmed" truncate maw={200}>
                              {job.customer.address}
                            </Text>
                          </Group>
                        )}
                      </>
                    )}
                    {col === 'status' && <StatusBadge status={job.status} />}
                    {col === 'agent' && (
                      <Text size="xs" fw={500}>
                        {job.assignedAgentName || (
                          <Text span c="dimmed" fs="italic">
                            Unassigned
                          </Text>
                        )}
                      </Text>
                    )}
                    {col === 'scheduledAt' && (
                      <Text size="xs" c="dimmed">
                        {formatDateTime(job.scheduledAt)}
                      </Text>
                    )}
                  </Table.Td>
                ))}
              </Table.Tr>
            ))
          )}
        </Table.Tbody>
      </Table>
    </Card>
  )
}