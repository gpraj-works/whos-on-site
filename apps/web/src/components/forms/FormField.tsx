import React from 'react'
import { Stack, Text } from '@mantine/core'

interface FormFieldProps {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required,
  error,
  children
}) => {
  return (
    <Stack gap={4}>
      <Text size="sm" fw={500}>
        {label} {required && <Text span c="red">*</Text>}
      </Text>
      {children}
      {error && (
        <Text size="xs" c="red">
          {error}
        </Text>
      )}
    </Stack>
  )
}
