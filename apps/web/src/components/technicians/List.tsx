import React from 'react'
import { Avatar, Badge, Card, Group, Paper, Stack, Table, Text, Title } from '@mantine/core'
import { TechnicianStatus } from '@whosonsite/shared'
import { MapPin, Phone } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useAppTheme } from '../../app/theme/ThemeContext'
import { formatDateTime, formatRelative } from '../../lib/date/format'
import { ApiErrorAlert } from '../feedback/ApiErrorAlert'
import { useTechnicians } from './queries'

export const TechnicianList: React.FC = () => {
  const { t } = useTranslation()
  const { primaryColor } = useAppTheme()
  const { data: technicians = [], isLoading, error } = useTechnicians()

  const getStatusColor = (status: TechnicianStatus) => {
    switch (status) {
      case TechnicianStatus.AVAILABLE:
        return 'green'
      case TechnicianStatus.BUSY:
        return 'orange'
      case TechnicianStatus.OFFLINE:
        return 'gray'
      default:
        return 'blue'
    }
  }

  const activeCount = technicians.filter((tech) => tech.status !== TechnicianStatus.OFFLINE).length
  const availableCount = technicians.filter(
    (tech) => tech.status === TechnicianStatus.AVAILABLE
  ).length

  return (
    <Stack gap="lg">
      <ApiErrorAlert error={error} />

      {/* Tech Overview Stats */}
      <Paper p="md" radius="md" withBorder>
        <Group justify="space-between" align="center" wrap="wrap">
          <Group gap="xl">
            <div>
              <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                Total Technicians
              </Text>
              <Title order={3}>{technicians.length}</Title>
            </div>
            <div>
              <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                Online / Active
              </Text>
              <Title order={3} c="green">
                {activeCount}
              </Title>
            </div>
            <div>
              <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                Available for Dispatch
              </Text>
              <Title order={3} c={primaryColor}>
                {availableCount}
              </Title>
            </div>
          </Group>
        </Group>
      </Paper>

      {/* Technicians Table */}
      <Card radius="md" withBorder shadow="xs" p="0">
        <Table highlightOnHover verticalSpacing="md" horizontalSpacing="md">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t('technicians.name', 'Technician')}</Table.Th>
              <Table.Th>{t('technicians.status', 'Status')}</Table.Th>
              <Table.Th>{t('technicians.phone', 'Phone Number')}</Table.Th>
              <Table.Th>{t('technicians.location', 'Last Known Location')}</Table.Th>
              <Table.Th>{t('technicians.lastUpdated', 'Last Updated')}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {isLoading ? (
              <Table.Tr>
                <Table.Td colSpan={5} ta="center" py="xl">
                  <Text size="sm" c="dimmed">
                    {t('common.loading', 'Loading technicians...')}
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : technicians.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={5} ta="center" py="xl">
                  <Text size="sm" c="dimmed">
                    {t('common.noData', 'No technicians registered in company.')}
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              technicians.map((tech) => (
                <Table.Tr key={tech.id}>
                  <Table.Td>
                    <Group gap="xs">
                      <Avatar color={primaryColor} radius="xl" size="sm">
                        {tech.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <div>
                        <Text size="sm" fw={700}>
                          {tech.name}
                        </Text>
                        <Text size="xs" c="dimmed">
                          ID: {tech.id.slice(0, 8)}...
                        </Text>
                      </div>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Badge size="sm" color={getStatusColor(tech.status)} variant="light">
                      {t(`status.${tech.status}`, tech.status)}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap={6}>
                      <Phone size={14} style={{ opacity: 0.6 }} />
                      <Text size="xs">{tech.phone || 'N/A'}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    {tech.location ? (
                      <Group gap={6}>
                        <MapPin size={14} style={{ color: 'teal' }} />
                        <Text size="xs">
                          {tech.location.lat.toFixed(4)}, {tech.location.lng.toFixed(4)}
                        </Text>
                      </Group>
                    ) : (
                      <Text size="xs" c="dimmed">
                        No GPS location fix
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs" c="dimmed">
                      {tech.lastLocationAt
                        ? `${formatRelative(tech.lastLocationAt)} (${formatDateTime(tech.lastLocationAt)})`
                        : 'N/A'}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Card>
    </Stack>
  )
}
