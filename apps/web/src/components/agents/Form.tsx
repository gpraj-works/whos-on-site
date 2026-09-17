import React, { useState } from 'react'
import { Button, Group, Modal, Select, Stack, TextInput } from '@mantine/core'
import { createAgentSchema, AgentDto, AgentStatus } from '@whosonsite/shared'
import { useTranslation } from 'react-i18next'

import { ApiErrorAlert } from '../feedback/ApiErrorAlert'
import { useCreateAgent, useUpdateAgent } from './queries'

export interface AgentFormModalProps {
  opened: boolean
  onClose: () => void
  onSuccess?: (tech: AgentDto) => void
  agent?: AgentDto
}

interface AgentFormBodyProps {
  agent?: AgentDto
  onClose: () => void
  onSuccess?: (tech: AgentDto) => void
}

export const AgentFormModal: React.FC<AgentFormModalProps> = ({
  opened,
  onClose,
  onSuccess,
  agent
}) => {
  const { t } = useTranslation()
  const isEditing = !!agent

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEditing ? t('agents.editTitle', 'Edit Agent') : t('agents.createTitle', 'New Agent')}
      centered
      radius="md"
    >
      <AgentFormBody
        key={opened ? 'open' : 'closed'}
        agent={agent}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </Modal>
  )
}

const AgentFormBody: React.FC<AgentFormBodyProps> = ({ agent, onClose, onSuccess }) => {
  const { t } = useTranslation()
  const createTechMutation = useCreateAgent()
  const updateTechMutation = useUpdateAgent()

  const isEditing = !!agent

  const [name, setName] = useState(agent?.name ?? '')
  const [phone, setPhone] = useState(agent?.phone ?? '')
  const [status, setStatus] = useState<string>(agent?.status ?? AgentStatus.AVAILABLE)
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; phone?: string }>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})

    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      status: status as AgentStatus
    }

    const parseResult = createAgentSchema.safeParse(payload)
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
      let saved: AgentDto
      if (isEditing) {
        saved = await updateTechMutation.mutateAsync({ id: agent!.id, data: parseResult.data })
      } else {
        saved = await createTechMutation.mutateAsync(parseResult.data)
      }

      onClose()
      if (onSuccess) {
        onSuccess(saved)
      }
    } catch {
      // Handled via mutation.error
    }
  }

  const isPending = createTechMutation.isPending || updateTechMutation.isPending
  const error = isEditing ? updateTechMutation.error : createTechMutation.error

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Stack gap="md">
        <ApiErrorAlert error={error} />

        <TextInput
          label={t('agents.name', 'Agent Name')}
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
          label={t('agents.phone', 'Phone Number')}
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
          label={t('agents.status', 'Initial Status')}
          data={[
            { value: AgentStatus.AVAILABLE, label: 'Available' },
            { value: AgentStatus.BUSY, label: 'Busy' },
            { value: AgentStatus.OFFLINE, label: 'Offline' }
          ]}
          value={status}
          onChange={(val) => setStatus(val || AgentStatus.AVAILABLE)}
        />

        <Group justify="flex-end" gap="xs" mt="sm">
          <Button variant="default" onClick={onClose} disabled={isPending}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button type="submit" loading={isPending}>
            {isEditing ? t('common.save', 'Save Changes') : t('common.save', 'Add')}
          </Button>
        </Group>
      </Stack>
    </form>
  )
}
