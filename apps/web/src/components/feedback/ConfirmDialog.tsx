import React from 'react'
import { Button, Group, Modal, Stack, Text } from '@mantine/core'
import { ApiErrorAlert } from './ApiErrorAlert'

export interface ConfirmDialogProps {
  opened: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  confirmColor?: string
  isLoading?: boolean
  error?: any
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  opened,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmColor = 'red',
  isLoading = false,
  error
}) => {
  return (
    <Modal opened={opened} onClose={onClose} title={title} centered radius="md">
      <Stack gap="md">
        {error && <ApiErrorAlert error={error} />}

        <Text size="sm">{message}</Text>

        <Group justify="flex-end" gap="xs" mt="sm">
          <Button variant="default" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button color={confirmColor} onClick={onConfirm} loading={isLoading}>
            {confirmLabel}
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
