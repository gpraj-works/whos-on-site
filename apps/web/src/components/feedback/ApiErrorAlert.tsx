import React from 'react'
import { Alert } from '@mantine/core'
import { AlertTriangle } from 'lucide-react'

interface ApiErrorAlertProps {
  error: Error | string | null | undefined
  title?: string
}

export const ApiErrorAlert: React.FC<ApiErrorAlertProps> = ({ error, title = 'Error' }) => {
  if (!error) return null

  const message = typeof error === 'string' ? error : error.message

  return (
    <Alert
      icon={<AlertTriangle size={18} />}
      title={title}
      color="red"
      variant="light"
      radius="md"
      my="sm"
    >
      {message}
    </Alert>
  )
}
