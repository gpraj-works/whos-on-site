import React from 'react'
import { ActionIcon, Card, Group, Text, Title } from '@mantine/core'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: React.ReactNode
  icon: LucideIcon
  color: string
  description?: React.ReactNode
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, description }) => {
  return (
    <Card p="md" radius="md" withBorder shadow="xs">
      <Group justify="space-between" align="center">
        <Text size="xs" c="dimmed" fw={700} tt="uppercase">
          {title}
        </Text>
        <ActionIcon color={color} variant="light" radius="md" size="lg">
          <Icon size={20} />
        </ActionIcon>
      </Group>
      <Group align="flex-end" gap="xs" mb={4}>
        <Title order={2}>{value}</Title>
      </Group>
      {description && (
        <Text size="xs" c="dimmed">
          {description}
        </Text>
      )}
    </Card>
  )
}