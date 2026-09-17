import React, { useState } from 'react'
import { Button, Group, Modal, Select, Stack, Text } from '@mantine/core'
import { useTranslation } from 'react-i18next'

import { ApiErrorAlert } from '../feedback/ApiErrorAlert'
import { useAgents } from '../agents/queries'
import { useAssignJob, useUnassignJob } from './queries'

interface AssignAgentModalProps {
  opened: boolean
  onClose: () => void
  jobId: string | null
  currentAgentId?: string | null
  currentAgentName?: string | null
}

export const AssignAgentModal: React.FC<AssignAgentModalProps> = ({
  opened,
  onClose,
  jobId,
  currentAgentId,
  currentAgentName
}) => {
  const { t } = useTranslation()
  const { data: agents = [], isLoading: isLoadingTechs } = useAgents()
  const assignJobMutation = useAssignJob()
  const unassignJobMutation = useUnassignJob()

  const [selectedTechId, setSelectedTechId] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleClose = () => {
    setSelectedTechId('')
    setValidationError(null)
    onClose()
  }

  const handleAssign = async () => {
    if (!jobId) return
    setValidationError(null)

    if (!selectedTechId) {
      setValidationError('Please select an agent to assign.')
      return
    }

    try {
      await assignJobMutation.mutateAsync({ id: jobId, agentId: selectedTechId })
      handleClose()
    } catch {
      // Error caught by assignJobMutation.error
    }
  }

  const handleUnassign = async () => {
    if (!jobId) return
    setValidationError(null)

    try {
      await unassignJobMutation.mutateAsync(jobId)
      handleClose()
    } catch {
      // Error caught by unassignJobMutation.error
    }
  }

  const techSelectData = agents.map((tech) => ({
    value: tech.id,
    label: `${tech.name} (${tech.phone}) — ${tech.status}`
  }))

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={t('jobs.assignTitle', 'Assign Agent')}
      centered
      radius="md"
      zIndex={1001}
    >
      <Stack gap="md">
        <ApiErrorAlert error={assignJobMutation.error || unassignJobMutation.error} />

        {currentAgentId && (
          <Text size="sm" c="dimmed">
            Currently assigned to:{' '}
            <Text span fw={700} c="var(--mantine-color-text)">
              {currentAgentName || currentAgentId}
            </Text>
          </Text>
        )}

        <Select
          label={t('jobs.selectAgent', 'Select Field Agent')}
          placeholder={
            isLoadingTechs
              ? t('common.loading', 'Loading agents...')
              : t('jobs.chooseAgent', 'Choose an available agent')
          }
          data={techSelectData}
          value={selectedTechId}
          onChange={(val) => {
            setSelectedTechId(val || '')
            if (validationError) setValidationError(null)
          }}
          searchable
          clearable
          withAsterisk
          error={validationError}
          comboboxProps={{ zIndex: 1002 }}
        />

        <Group justify="space-between" mt="sm">
          {currentAgentId ? (
            <Button
              color="red"
              variant="light"
              onClick={handleUnassign}
              loading={unassignJobMutation.isPending}
            >
              {t('jobs.unassignButton', 'Unassign Current Agent')}
            </Button>
          ) : (
            <div />
          )}

          <Group gap="xs">
            <Button variant="default" onClick={handleClose}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              onClick={handleAssign}
              loading={assignJobMutation.isPending}
              disabled={!selectedTechId}
            >
              {t('jobs.assignConfirm', 'Update')}
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  )
}
