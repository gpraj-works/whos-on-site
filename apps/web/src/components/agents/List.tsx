import React from 'react'
import { Avatar, Badge, Card, Group, Paper, Stack, Table, Text, Title } from '@mantine/core'
import { AgentStatus } from '@whosonsite/shared'
import { MapPin, Phone } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useAppTheme } from '../../app/theme/ThemeContext'
import { formatDateTime, formatRelative } from '@whosonsite/shared'
import { ApiErrorAlert } from '../feedback/ApiErrorAlert'
import { useAgents } from './queries'

export const AgentList: React.FC = () => {
  const { t } = useTranslation()
  const { primaryColor } = useAppTheme()
  const { data: agents = [], isLoading, error } = useAgents()

  const getStatusColor = (status: AgentStatus) => {
    switch (status) {
      case AgentStatus.AVAILABLE:
        return 'green'
      case AgentStatus.BUSY:
        return 'orange'
      case AgentStatus.OFFLINE:
        return 'gray'
      default:
        return 'blue'
    }
  }

  const activeCount = agents.filter((tech) => tech.status !== AgentStatus.OFFLINE).length
  const availableCount = agents.filter(
    (tech) => tech.status === AgentStatus.AVAILABLE
  ).length

  return (
    <Stack gap="sm">
      <ApiErrorAlert error={error} />

      {/* Tech Overview Stats */}
      <Paper p="sm" radius="md" withBorder>
        <Group justify="space-between" align="center" wrap="wrap">
          <Group gap="xl">
            <div>
              <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                Total Agents
              </Text>
              <Title order={3}>{agents.length}</Title>
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

      {/* Agents Table */}
      <Card radius="md" withBorder shadow="xs" p="0">
        <Table.ScrollContainer minWidth={800}>
          <Table highlightOnHover verticalSpacing="md" horizontalSpacing="md">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t('agents.name', 'Agent')}</Table.Th>
                <Table.Th>{t('agents.status', 'Status')}</Table.Th>
                <Table.Th>{t('agents.phone', 'Phone Number')}</Table.Th>
                <Table.Th>{t('agents.location', 'Last Known Location')}</Table.Th>
                <Table.Th>{t('agents.lastUpdated', 'Last Updated')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {isLoading ? (
                <Table.Tr>
                  <Table.Td colSpan={5} ta="center" py="xl">
                    <Text size="sm" c="dimmed">
                      {t('common.loading', 'Loading agents...')}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : agents.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={5} ta="center" py="xl">
                    <Text size="sm" c="dimmed">
                      {t('common.noData', 'No agents registered in company.')}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                agents.map((tech) => (
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
        </Table.ScrollContainer>
      </Card>
    </Stack>
  )
}
