import React, { useState } from 'react'
import { ActionIcon, Button, Group, Modal, Select, Stack, Textarea } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { createJobSchema, CustomerDto, JobDto } from '@whosonsite/shared'
import { dayjs } from '@whosonsite/shared'
import { Calendar, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { TimeInput } from '../shared/TimeInput'

import { useCustomers } from '../customers/queries'
import { CustomerFormModal } from '../customers/Form'
import { ApiErrorAlert } from '../feedback/ApiErrorAlert'
import { useCreateJob, useUpdateJob } from './queries'

export interface JobFormModalProps {
  opened: boolean
  onClose: () => void
  job?: JobDto
  zIndex?: number
}

interface JobFormBodyProps {
  job?: JobDto
  onClose: () => void
  zIndex?: number
}

export const JobFormModal: React.FC<JobFormModalProps> = ({ opened, onClose, job, zIndex }) => {
  const { t } = useTranslation()
  const isEditing = !!job

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEditing ? t('jobs.editTitle', 'Edit Job') : t('jobs.createTitle', 'New Job')}
      size="md"
      centered
      radius="md"
      zIndex={zIndex}
    >
      <JobFormBody key={opened ? 'open' : 'closed'} job={job} onClose={onClose} zIndex={zIndex} />
    </Modal>
  )
}

const JobFormBody: React.FC<JobFormBodyProps> = ({ job, onClose, zIndex }) => {
  const { t } = useTranslation()
  const { data: customers = [], isLoading: isLoadingCustomers } = useCustomers()
  const createJobMutation = useCreateJob()
  const updateJobMutation = useUpdateJob()

  const isEditing = !!job
  const scheduledAt = job?.scheduledAt ? dayjs(job.scheduledAt) : null

  const [customerId, setCustomerId] = useState(job?.customerId ?? '')
  const [scheduledDate, setScheduledDate] = useState<Date | null>(
    scheduledAt?.isValid() ? scheduledAt.toDate() : null
  )

  const [hour, setHour] = useState(() => {
    const h = scheduledAt?.isValid() ? scheduledAt.hour() : 9
    const h12 = h % 12 === 0 ? 12 : h % 12
    return h12.toString().padStart(2, '0')
  })
  const [minute, setMinute] = useState(() =>
    (scheduledAt?.isValid() ? scheduledAt.minute() : 0).toString().padStart(2, '0')
  )
  const [ampm, setAmpm] = useState(() =>
    scheduledAt?.isValid() ? (scheduledAt.hour() >= 12 ? 'PM' : 'AM') : 'AM'
  )
  const [notes, setNotes] = useState(job?.notes || '')

  const [createCustomerModalOpened, setCreateCustomerModalOpened] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ customerId?: string; scheduledAt?: string }>({})

  const handleCustomerCreated = (newCustomer: CustomerDto) => {
    setCustomerId(newCustomer.id)
    setFieldErrors((prev) => ({ ...prev, customerId: undefined }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})

    let isoScheduledAt: string | undefined = undefined
    if (scheduledDate) {
      let hours24 = parseInt(hour, 10)
      if (ampm === 'PM' && hours24 < 12) hours24 += 12
      if (ampm === 'AM' && hours24 === 12) hours24 = 0

      isoScheduledAt = dayjs(scheduledDate)
        .hour(hours24)
        .minute(parseInt(minute, 10))
        .second(0)
        .millisecond(0)
        .toISOString()
    }

    const rawInput = {
      customerId,
      scheduledAt: isoScheduledAt,
      notes: notes.trim() || undefined,
      location: (() => {
        const customer = customers.find((c) => c.id === customerId)
        if (customer?.latitude != null && customer?.longitude != null) {
          return { lat: customer.latitude, lng: customer.longitude }
        }
        return undefined
      })()
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
      if (isEditing) {
        await updateJobMutation.mutateAsync({ id: job!.id, input: parseResult.data })
      } else {
        await createJobMutation.mutateAsync(parseResult.data)
      }
      onClose()
    } catch {
      // Error handled by mutation.error
    }
  }

  const customerSelectData = customers.map((c) => ({
    value: c.id,
    label: `${c.name} (${c.address})`
  }))

  const isPending = createJobMutation.isPending || updateJobMutation.isPending
  const error = isEditing ? updateJobMutation.error : createJobMutation.error

  return (
    <>
      <form onSubmit={handleSubmit} noValidate>
        <Stack gap="md">
          <ApiErrorAlert error={error} />

          {/* Customer selection */}
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
              onChange={(val: string | null) => {
                setCustomerId(val || '')
                if (fieldErrors.customerId)
                  setFieldErrors((prev) => ({ ...prev, customerId: undefined }))
              }}
              searchable
              clearable
              withAsterisk
              error={fieldErrors.customerId}
              style={{ flex: 1 }}
              comboboxProps={{ zIndex: zIndex ? zIndex + 1 : undefined }}
            />
            {!isEditing && (
              <ActionIcon
                variant="light"
                color="teal"
                size="lg"
                title={t('jobs.addCustomer', 'Add Customer')}
                onClick={() => setCreateCustomerModalOpened(true)}
              >
                <Plus size={18} />
              </ActionIcon>
            )}
          </Group>

          {/* Schedule Date */}
          <DatePickerInput
            label="Schedule Date"
            placeholder="Pick date"
            leftSection={<Calendar size={16} />}
            value={scheduledDate}
            onChange={(val: Date | null) => {
              setScheduledDate(val)
              if (fieldErrors.scheduledAt)
                setFieldErrors((prev) => ({ ...prev, scheduledAt: undefined }))
            }}
            error={fieldErrors.scheduledAt}
            clearable
            popoverProps={{ zIndex: zIndex ? zIndex + 1 : undefined }}
          />

          {/* Schedule Time */}
          <TimeInput
            label="Schedule Time"
            hour={hour}
            minute={minute}
            ampm={ampm}
            onHourChange={setHour}
            onMinuteChange={setMinute}
            onAmpmChange={setAmpm}
            error={fieldErrors.scheduledAt ? 'Invalid time' : undefined}
            zIndex={zIndex ? zIndex + 1 : undefined}
          />

          {/* Description */}
          <Textarea
            label="Description"
            placeholder={t('jobs.notesPlaceholder', 'Enter job service details or instructions')}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />

          <Group justify="flex-end" gap="xs" mt="sm">
            <Button variant="default" onClick={onClose} disabled={isPending}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button type="submit" loading={isPending}>
              {isEditing ? t('common.save', 'Save Changes') : t('jobs.createSubmit', 'Add')}
            </Button>
          </Group>
        </Stack>
      </form>

      <CustomerFormModal
        opened={createCustomerModalOpened}
        onClose={() => setCreateCustomerModalOpened(false)}
        onSuccess={handleCustomerCreated}
        zIndex={zIndex ? zIndex + 1 : undefined}
      />
    </>
  )
}