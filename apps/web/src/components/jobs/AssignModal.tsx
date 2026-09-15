import React, { useState } from 'react'
import { Button, Group, Modal, Select, Stack, Text } from '@mantine/core'
import { useTranslation } from 'react-i18next'

import { ApiErrorAlert } from '../feedback/ApiErrorAlert'
import { useTeamMembers } from '../team/queries'
import { useAssignJob, useUnassignJob } from './queries'

interface AssignTeamMemberModalProps {
  opened: boolean
  onClose: () => void
  jobId: string | null
  currentTeamMemberId?: string | null
  currentTeamMemberName?: string | null
}

export const AssignTeamMemberModal: React.FC<AssignTeamMemberModalProps> = ({
  opened,
  onClose,
  jobId,
  currentTeamMemberId,
  currentTeamMemberName
}) => {
  const { t } = useTranslation()
  const { data: teamMembers = [], isLoading: isLoadingTechs } = useTeamMembers()
  const assignJobMutation = useAssignJob()
  const unassignJobMutation = useUnassignJob()

  const [selectedTechId, setSelectedTechId] = useState<string>('')
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
      setValidationError('Please select a teamMember to assign.')
      return
    }

    try {
      await assignJobMutation.mutateAsync({ id: jobId, teamMemberId: selectedTechId })
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

  const techSelectData = teamMembers.map((tech) => ({
    value: tech.id,
    label: `${tech.name} (${tech.phone}) — ${tech.status}`
  }))

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={t('jobs.assignTitle', 'Assign TeamMember')}
      centered
      radius="md"
    >
      <Stack gap="md">
        <ApiErrorAlert error={assignJobMutation.error || unassignJobMutation.error} />

        {currentTeamMemberId && (
          <Text size="sm" c="dimmed">
            Currently assigned to:{' '}
            <Text span fw={700} c="var(--mantine-color-text)">
              {currentTeamMemberName || currentTeamMemberId}
            </Text>
          </Text>
        )}

        <Select
          label={t('jobs.selectTeamMember', 'Select Field TeamMember')}
          placeholder={
            isLoadingTechs
              ? t('common.loading', 'Loading teamMembers...')
              : t('jobs.chooseTeamMember', 'Choose an available teamMember')
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
        />

        <Group justify="space-between" mt="sm">
          {currentTeamMemberId ? (
            <Button
              color="red"
              variant="light"
              onClick={handleUnassign}
              loading={unassignJobMutation.isPending}
            >
              {t('jobs.unassignButton', 'Unassign Current TeamMember')}
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
