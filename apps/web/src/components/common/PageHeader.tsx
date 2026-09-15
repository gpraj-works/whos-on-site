import React from 'react'
import { Group, Stack, Text, Title } from '@mantine/core'

interface PageHeaderProps {
  title: string
  description?: string
  subtitle?: string
  action?: React.ReactNode
  actions?: React.ReactNode
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  subtitle,
  action,
  actions
}) => {
  const subText = description || subtitle
  const actionNode = action || actions

  return (
    <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
      <Stack gap={4}>
        <Title order={2} lh={1.2}>
          {title}
        </Title>
        {subText && (
          <Text c="dimmed" size="sm">
            {subText}
          </Text>
        )}
      </Stack>
      {actionNode && <Group gap="xs">{actionNode}</Group>}
    </Group>
  )
}
