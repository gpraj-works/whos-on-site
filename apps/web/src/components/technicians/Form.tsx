import React, { useState } from 'react'
import { Button, Group, Modal, Select, Stack, TextInput } from '@mantine/core'
import { createTechnicianSchema, TechnicianDto, TechnicianStatus } from '@whosonsite/shared'
import { useTranslation } from 'react-i18next'

import { ApiErrorAlert } from '../feedback/ApiErrorAlert'
import { useCreateTechnician } from './queries'

interface CreateTechnicianModalProps {
  opened: boolean
  onClose: () => void
  onSuccess?: (tech: TechnicianDto) => void
}

export const CreateTechnicianModal: React.FC<CreateTechnicianModalProps> = ({
  opened,
  onClose,
  onSuccess
}) => {
  const { t } = useTranslation()
  const createTechMutation = useCreateTechnician()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState<string>(TechnicianStatus.AVAILABLE)
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; phone?: string }>({})

  const handleReset = () => {
    setName('')
    setPhone('')
    setStatus(TechnicianStatus.AVAILABLE)
    setFieldErrors({})
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})

    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      status: status as TechnicianStatus
    }

    const parseResult = createTechnicianSchema.safeParse(payload)
    if (!parseResult.success) {
      const formatted: { name?: string; phone?: string } = {}
      parseResult.error.errors.forEach((err: { path: (string | number)[]; message: string }) => {
        const field = err.path[0] as 'name' | 'phone'
        if (field && !formatted[field]) {
          formatted[field] = err.message
        }
      })
      setFieldErrors(formatted)
      return
    }

    try {
      const created = await createTechMutation.mutateAsync(parseResult.data)
      handleClose()
      if (onSuccess) {
        onSuccess(created)
      }
    } catch {
      // Handled via createTechMutation.error
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={t('technicians.createTitle', 'New Technician')}
      centered
      radius="md"
    >
      <form onSubmit={handleSubmit} noValidate>
        <Stack gap="md">
          <ApiErrorAlert error={createTechMutation.error} />

          <TextInput
            label={t('technicians.name', 'Technician Name')}
            placeholder="John Doe"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }))
            }}
            withAsterisk
            error={fieldErrors.name}
          />

          <TextInput
            label={t('technicians.phone', 'Phone Number')}
            placeholder="+1 404-555-0192"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value)
              if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: undefined }))
            }}
            withAsterisk
            error={fieldErrors.phone}
          />

          <Select
            label={t('technicians.status', 'Initial Status')}
            data={[
              { value: TechnicianStatus.AVAILABLE, label: 'Available' },
              { value: TechnicianStatus.BUSY, label: 'Busy' },
              { value: TechnicianStatus.OFFLINE, label: 'Offline' }
            ]}
            value={status}
            onChange={(val) => setStatus(val || TechnicianStatus.AVAILABLE)}
          />

          <Group justify="flex-end" gap="xs" mt="sm">
            <Button variant="default" onClick={handleClose}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button type="submit" loading={createTechMutation.isPending}>
              {t('common.save', 'Add')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}
