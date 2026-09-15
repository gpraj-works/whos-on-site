import React from 'react'
import { Button, Group, Modal, Text } from '@mantine/core'
import { useTranslation } from 'react-i18next'

interface ConfirmDialogProps {
  opened: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  loading?: boolean
  color?: string
  zIndex?: number
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  opened,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel,
  loading = false,
  color = 'red',
  zIndex = 1100
}) => {
  const { t } = useTranslation()

  return (
    <Modal opened={opened} onClose={onClose} title={title} centered radius="md" zIndex={zIndex}>
      <Text size="sm" mb="lg">
        {message}
      </Text>
      <Group justify="flex-end" gap="xs">
        <Button variant="default" onClick={onClose} disabled={loading}>
          {cancelLabel || t('common.cancel')}
        </Button>
        <Button color={color} onClick={onConfirm} loading={loading}>
          {confirmLabel || t('common.confirm')}
        </Button>
      </Group>
    </Modal>
  )
}
