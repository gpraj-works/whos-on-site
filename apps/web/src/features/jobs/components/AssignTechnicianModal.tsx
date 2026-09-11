import React, { useState } from 'react'
import { Button, Group, Modal, Select, Stack, Text } from '@mantine/core'
import { useTranslation } from 'react-i18next'

import { ApiErrorAlert } from '../../../components/feedback/ApiErrorAlert'
import { useTechnicians } from '../../technicians/api/technicianQueries'
import { useAssignJob, useUnassignJob } from '../api/jobQueries'

interface AssignTechnicianModalProps {
  opened: boolean
  onClose: () => void
  jobId: string | null
  currentTechnicianId?: string | null
  currentTechnicianName?: string | null
}

export const AssignTechnicianModal: React.FC<AssignTechnicianModalProps> = ({
  opened,
  onClose,
  jobId,
  currentTechnicianId,
  currentTechnicianName
}) => {
  const { t } = useTranslation()
  const { data: technicians = [], isLoading: isLoadingTechs } = useTechnicians()
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
      setValidationError('Please select a technician to assign.')
      return
    }

    try {
      await assignJobMutation.mutateAsync({ id: jobId, technicianId: selectedTechId })
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

  const techSelectData = technicians.map((tech) => ({
    value: tech.id,
    label: `${tech.name} (${tech.phone}) — ${tech.status}`
  }))

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={t('jobs.assignTitle', 'Assign Technician')}
      centered
      radius="md"
    >
      <Stack gap="md">
        <ApiErrorAlert error={assignJobMutation.error || unassignJobMutation.error} />
        {validationError && <ApiErrorAlert error={validationError} title="Validation Error" />}

        {currentTechnicianId && (
          <Text size="sm" c="dimmed">
            Currently assigned to:{' '}
            <Text span fw={700} c="var(--mantine-color-text)">
              {currentTechnicianName || currentTechnicianId}
            </Text>
          </Text>
        )}

        <Select
          label={t('jobs.selectTechnician', 'Select Field Technician')}
          placeholder={
            isLoadingTechs
              ? t('common.loading', 'Loading technicians...')
              : t('jobs.chooseTechnician', 'Choose an available technician')
          }
          data={techSelectData}
          value={selectedTechId}
          onChange={(val) => setSelectedTechId(val || '')}
          searchable
          clearable
        />

        <Group justify="space-between" mt="sm">
          {currentTechnicianId ? (
            <Button
              color="red"
              variant="light"
              onClick={handleUnassign}
              loading={unassignJobMutation.isPending}
            >
              {t('jobs.unassignButton', 'Unassign Current Technician')}
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
              {t('jobs.assignConfirm', 'Assign Technician')}
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  )
}
