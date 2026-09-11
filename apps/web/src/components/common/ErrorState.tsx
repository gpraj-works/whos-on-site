import React from 'react'
import { Alert, Button, Stack, Text } from '@mantine/core'
import { AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export const ErrorState: React.FC<ErrorStateProps> = ({ title, message, onRetry }) => {
  const { t } = useTranslation()

  return (
    <Alert
      variant="light"
      color="red"
      title={title || t('common.error')}
      icon={<AlertCircle size={20} />}
      my="md"
    >
      <Stack gap="xs">
        <Text size="sm">{message || t('common.error')}</Text>
        {onRetry && (
          <div>
            <Button size="xs" color="red" variant="outline" onClick={onRetry}>
              {t('common.refresh')}
            </Button>
          </div>
        )}
      </Stack>
    </Alert>
  )
}
