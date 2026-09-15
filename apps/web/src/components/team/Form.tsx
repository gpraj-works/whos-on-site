import React, { useState } from 'react'
import { Button, Group, Modal, Select, Stack, TextInput } from '@mantine/core'
import { createTeamMemberSchema, TeamMemberDto, TeamMemberStatus } from '@whosonsite/shared'
import { useTranslation } from 'react-i18next'

import { ApiErrorAlert } from '../feedback/ApiErrorAlert'
import { useCreateTeamMember } from './queries'

interface CreateTeamMemberModalProps {
  opened: boolean
  onClose: () => void
  onSuccess?: (tech: TeamMemberDto) => void
}

export const CreateTeamMemberModal: React.FC<CreateTeamMemberModalProps> = ({
  opened,
  onClose,
  onSuccess
}) => {
  const { t } = useTranslation()
  const createTechMutation = useCreateTeamMember()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState<string>(TeamMemberStatus.AVAILABLE)
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; phone?: string }>({})

  const handleReset = () => {
    setName('')
    setPhone('')
    setStatus(TeamMemberStatus.AVAILABLE)
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
      status: status as TeamMemberStatus
    }

    const parseResult = createTeamMemberSchema.safeParse(payload)
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
      title={t('teamMembers.createTitle', 'New TeamMember')}
      centered
      radius="md"
    >
      <form onSubmit={handleSubmit} noValidate>
        <Stack gap="md">
          <ApiErrorAlert error={createTechMutation.error} />

          <TextInput
            label={t('teamMembers.name', 'TeamMember Name')}
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
            label={t('teamMembers.phone', 'Phone Number')}
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
            label={t('teamMembers.status', 'Initial Status')}
            data={[
              { value: TeamMemberStatus.AVAILABLE, label: 'Available' },
              { value: TeamMemberStatus.BUSY, label: 'Busy' },
              { value: TeamMemberStatus.OFFLINE, label: 'Offline' }
            ]}
            value={status}
            onChange={(val) => setStatus(val || TeamMemberStatus.AVAILABLE)}
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
