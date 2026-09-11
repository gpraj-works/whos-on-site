import React from 'react'
import { Button, Paper, Stack, Text, Title } from '@mantine/core'
import { FolderOpen } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface EmptyStateProps {
  title?: string
  description?: string
  icon?: React.ReactNode
  actionLabel?: string
  onAction?: () => void
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction
}) => {
  const { t } = useTranslation()

  return (
    <Paper p="xl" radius="md" withBorder style={{ textAlign: 'center' }}>
      <Stack align="center" gap="sm">
        <div style={{ opacity: 0.6 }}>{icon || <FolderOpen size={48} />}</div>
        <Title order={4}>{title || t('common.noData')}</Title>
        {description && (
          <Text c="dimmed" size="sm" maw={400}>
            {description}
          </Text>
        )}
        {actionLabel && onAction && (
          <Button mt="xs" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </Stack>
    </Paper>
  )
}
