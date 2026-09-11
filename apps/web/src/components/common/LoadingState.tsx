import React from 'react'
import { Center, Loader, Stack, Text } from '@mantine/core'
import { useTranslation } from 'react-i18next'

interface LoadingStateProps {
  message?: string
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message }) => {
  const { t } = useTranslation()

  return (
    <Center p="xl" mih={200}>
      <Stack align="center" gap="sm">
        <Loader size="md" type="bars" />
        <Text size="sm" c="dimmed">
          {message || t('common.loading')}
        </Text>
      </Stack>
    </Center>
  )
}
