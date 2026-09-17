import React, { useState } from 'react'
import {
  ActionIcon,
  Button,
  Group,
  Modal,
  Popover,
  ScrollArea,
  Select,
  Stack,
  Textarea,
  TextInput
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { createJobSchema, CustomerDto } from '@whosonsite/shared'
import { Calendar, Clock, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useCustomers } from '../customers/queries'
import { CreateCustomerModal } from '../customers/Form'
import { ApiErrorAlert } from '../feedback/ApiErrorAlert'
import { useCreateJob } from './queries'

interface CreateJobModalProps {
  opened: boolean
  onClose: () => void
}

const hoursList = Array.from({ length: 12 }).map((_, i) => (i + 1).toString().padStart(2, '0'))
const minutesList = Array.from({ length: 60 }).map((_, i) => i.toString().padStart(2, '0'))
const ampmList = ['AM', 'PM']

const TimeColumn = ({ data, value, onChange }: { data: string[]; value: string; onChange: (v: string) => void }) => (
  <ScrollArea h={180} type="never">
    <Stack gap={2}>
      {data.map((item) => (
        <Button
          key={item}
          variant={value === item ? 'filled' : 'subtle'}
          color={value === item ? undefined : 'gray'}
          onClick={() => onChange(item)}
          size="sm"
          px="sm"
        >
          {item}
        </Button>
      ))}
    </Stack>
  </ScrollArea>
)

export const CreateJobModal: React.FC<CreateJobModalProps> = ({ opened, onClose }) => {
  const { t } = useTranslation()
  const { data: customers = [], isLoading: isLoadingCustomers } = useCustomers()
  const createJobMutation = useCreateJob()

  const [customerId, setCustomerId] = useState('')
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null)
  
  // Custom Time Picker State
  const [timeOpened, setTimeOpened] = useState(false)
  const [hour, setHour] = useState<string>('09')
  const [minute, setMinute] = useState<string>('00')
  const [ampm, setAmpm] = useState<string>('AM')
  const [notes, setNotes] = useState('')

  const [createCustomerModalOpened, setCreateCustomerModalOpened] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ customerId?: string; scheduledAt?: string }>({})

  const handleReset = () => {
    setCustomerId('')
    setScheduledDate(null)
    setHour('09')
    setMinute('00')
    setAmpm('AM')
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
    if (scheduledDate) {
      const combinedDate = new Date(scheduledDate)
      let hours24 = parseInt(hour, 10)
      if (ampm === 'PM' && hours24 < 12) hours24 += 12
      if (ampm === 'AM' && hours24 === 12) hours24 = 0
      
      combinedDate.setHours(hours24, parseInt(minute, 10), 0, 0)
      isoScheduledAt = combinedDate.toISOString()
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
        size="md"
        centered
        radius="md"
      >
        <form onSubmit={handleSubmit} noValidate>
          <Stack gap="md">
            <ApiErrorAlert error={createJobMutation.error} />

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

            {/* Schedule Date */}
            <DatePickerInput
              label="Schedule Date"
              placeholder="Pick date"
              leftSection={<Calendar size={16} />}
              value={scheduledDate}
              onChange={(val) => {
                setScheduledDate(val)
                if (fieldErrors.scheduledAt) setFieldErrors((prev) => ({ ...prev, scheduledAt: undefined }))
              }}
              error={fieldErrors.scheduledAt}
              clearable
            />

            {/* Schedule Time */}
            <Popover opened={timeOpened} onChange={setTimeOpened} position="bottom-start" withArrow shadow="md">
              <Popover.Target>
                <TextInput
                  label="Schedule Time"
                  placeholder="Select time"
                  readOnly
                  leftSection={<Clock size={16} />}
                  value={`${hour}:${minute} ${ampm}`}
                  onClick={() => setTimeOpened((o) => !o)}
                  styles={{ input: { cursor: 'pointer' } }}
                  error={fieldErrors.scheduledAt ? 'Invalid time' : undefined}
                />
              </Popover.Target>
              <Popover.Dropdown p="xs">
                <Group gap="xs" wrap="nowrap" align="flex-start">
                  <TimeColumn data={hoursList} value={hour} onChange={setHour} />
                  <TimeColumn data={minutesList} value={minute} onChange={setMinute} />
                  <TimeColumn data={ampmList} value={ampm} onChange={setAmpm} />
                </Group>
              </Popover.Dropdown>
            </Popover>

            {/* Description */}
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
