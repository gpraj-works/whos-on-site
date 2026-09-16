import React, { useState } from 'react'
import {
  ActionIcon,
  Button,
  Grid,
  Group,
  Modal,
  Select,
  Stack,
  Textarea,
  TextInput
} from '@mantine/core'
import { createJobSchema, CustomerDto } from '@whosonsite/shared'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useCustomers } from '../customers/queries'
import { CreateCustomerModal } from '../customers/Form'
import { ApiErrorAlert } from '../feedback/ApiErrorAlert'
import { useCreateJob } from './queries'

interface CreateJobModalProps {
  opened: boolean
  onClose: () => void
}

export const CreateJobModal: React.FC<CreateJobModalProps> = ({ opened, onClose }) => {
  const { t } = useTranslation()
  const { data: customers = [], isLoading: isLoadingCustomers } = useCustomers()
  const createJobMutation = useCreateJob()

  const [customerId, setCustomerId] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [notes, setNotes] = useState('')

  const [createCustomerModalOpened, setCreateCustomerModalOpened] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ customerId?: string; scheduledAt?: string }>({})

  const handleReset = () => {
    setCustomerId('')
    setScheduledAt('')
    setNotes('')
    setFieldErrors({})
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  const handleCustomerCreated = (newCustomer: CustomerDto) => {
    setCustomerId(newCustomer.id)
    setFieldErrors((prev) => ({ ...prev, customerId: undefined }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})

    let isoScheduledAt: string | undefined = undefined
    if (scheduledAt) {
      const parsedDate = new Date(scheduledAt)
      if (isNaN(parsedDate.getTime())) {
        setFieldErrors({ scheduledAt: 'Invalid schedule date/time' })
        return
      }
      isoScheduledAt = parsedDate.toISOString()
    }

    const rawInput = {
      customerId,
      scheduledAt: isoScheduledAt,
      notes: notes.trim() || undefined
    }

    const parseResult = createJobSchema.safeParse(rawInput)
    if (!parseResult.success) {
      const formatted: { customerId?: string; scheduledAt?: string } = {}
      parseResult.error.errors.forEach((err: { path: (string | number)[]; message: string }) => {
        if (err.path[0] === 'customerId') formatted.customerId = 'Please select a customer'
        else if (err.path[0] === 'scheduledAt') formatted.scheduledAt = err.message
      })
      setFieldErrors(formatted)
      return
    }

    try {
      await createJobMutation.mutateAsync(parseResult.data)
      handleClose()
    } catch {
      // Error handled by createJobMutation.error
    }
  }

  const customerSelectData = customers.map((c) => ({
    value: c.id,
    label: `${c.name} (${c.address})`
  }))

  return (
    <>
      <Modal
        opened={opened}
        onClose={handleClose}
        title={t('jobs.createTitle', 'New Job')}
        size="lg"
        centered
        radius="md"
      >
        <form onSubmit={handleSubmit} noValidate>
          <Stack gap="md">
            <ApiErrorAlert error={createJobMutation.error} />

            {/* Row 1: Customer selection with plus icon button + Schedule */}
            <Grid align="flex-end" gutter="md">
              <Grid.Col span={{ base: 12, sm: 7 }}>
                <Group gap="xs" align="flex-end" wrap="nowrap">
                  <Select
                    label={t('jobs.customer', 'Customer')}
                    placeholder={
                      isLoadingCustomers
                        ? t('common.loading', 'Loading customers...')
                        : t('jobs.selectCustomer', 'Select a customer')
                    }
                    data={customerSelectData}
                    value={customerId}
                    onChange={(val) => {
                      setCustomerId(val || '')
                      if (fieldErrors.customerId) setFieldErrors((prev) => ({ ...prev, customerId: undefined }))
                    }}
                    searchable
                    clearable
                    withAsterisk
                    error={fieldErrors.customerId}
                    style={{ flex: 1 }}
                  />
                  <ActionIcon
                    variant="light"
                    color="teal"
                    size="lg"
                    title={t('jobs.addCustomer', 'Add Customer')}
                    onClick={() => setCreateCustomerModalOpened(true)}
                  >
                    <Plus size={18} />
                  </ActionIcon>
                </Group>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 5 }}>
                <TextInput
                  label="Schedule"
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => {
                    setScheduledAt(e.target.value)
                    if (fieldErrors.scheduledAt) setFieldErrors((prev) => ({ ...prev, scheduledAt: undefined }))
                  }}
                  error={fieldErrors.scheduledAt}
                />
              </Grid.Col>
            </Grid>

            {/* Row 2: Description */}
            <Textarea
              label="Description"
              placeholder={t('jobs.notesPlaceholder', 'Enter job service details or instructions')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />

            <Group justify="flex-end" gap="xs" mt="sm">
              <Button variant="default" onClick={handleClose}>
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button type="submit" loading={createJobMutation.isPending}>
                {t('jobs.createSubmit', 'Add')}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <CreateCustomerModal
        opened={createCustomerModalOpened}
        onClose={() => setCreateCustomerModalOpened(false)}
        onSuccess={handleCustomerCreated}
      />
    </>
  )
}
