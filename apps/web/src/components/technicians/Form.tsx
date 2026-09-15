import React, { useState } from 'react'
import { Button, Group, Modal, Select, Stack, TextInput } from '@mantine/core'
import { TechnicianDto, TechnicianStatus } from '@whosonsite/shared'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { ApiErrorAlert } from '../feedback/ApiErrorAlert'
import { useCreateTechnician } from './queries'

const createTechSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(7, 'Invalid phone number'),
  status: z.nativeEnum(TechnicianStatus).optional()
})

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
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleReset = () => {
    setName('')
    setPhone('')
    setStatus(TechnicianStatus.AVAILABLE)
    setValidationError(null)
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      status: status as TechnicianStatus
    }

    const parseResult = createTechSchema.safeParse(payload)
    if (!parseResult.success) {
      setValidationError(parseResult.error.errors[0]?.message || 'Invalid technician details')
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
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <ApiErrorAlert error={createTechMutation.error} />
          {validationError && <ApiErrorAlert error={validationError} title="Validation Error" />}

          <TextInput
            label={t('technicians.name', 'Technician Name')}
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <TextInput
            label={t('technicians.phone', 'Phone Number')}
            placeholder="+1 404-555-0192"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
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
