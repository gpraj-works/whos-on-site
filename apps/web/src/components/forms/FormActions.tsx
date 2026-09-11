import React from 'react'
import { Button, Group } from '@mantine/core'
import { useTranslation } from 'react-i18next'

interface FormActionsProps {
  onCancel?: () => void
  submitLabel?: string
  cancelLabel?: string
  loading?: boolean
  disabled?: boolean
}

export const FormActions: React.FC<FormActionsProps> = ({
  onCancel,
  submitLabel,
  cancelLabel,
  loading = false,
  disabled = false
}) => {
  const { t } = useTranslation()

  return (
    <Group justify="flex-end" gap="xs" mt="lg">
      {onCancel && (
        <Button variant="default" onClick={onCancel} disabled={loading}>
          {cancelLabel || t('common.cancel')}
        </Button>
      )}
      <Button type="submit" loading={loading} disabled={disabled}>
        {submitLabel || t('common.save')}
      </Button>
    </Group>
  )
}
