import React, { useState } from 'react'
import { Button, Group, Modal, Select, Stack, Text, Textarea, TextInput } from '@mantine/core'
import { createCustomerSchema, createJobSchema } from '@whosonsite/shared'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { ApiErrorAlert } from '../../../components/feedback/ApiErrorAlert'
import { useCreateCustomer, useCustomers } from '../../customers/api/customerQueries'
import { useCreateJob } from '../api/jobQueries'

interface CreateJobModalProps {
  opened: boolean
  onClose: () => void
}

export const CreateJobModal: React.FC<CreateJobModalProps> = ({ opened, onClose }) => {
  const { t } = useTranslation()
  const { data: customers = [], isLoading: isLoadingCustomers } = useCustomers()
  const createJobMutation = useCreateJob()
  const createCustomerMutation = useCreateCustomer()

  const [customerId, setCustomerId] = useState<string>('')
  const [scheduledAt, setScheduledAt] = useState<string>('')
  const [notes, setNotes] = useState<string>('')

  // New Customer inline state
  const [isAddingCustomer, setIsAddingCustomer] = useState(false)
  const [newCustName, setNewCustName] = useState('')
  const [newCustMobile, setNewCustMobile] = useState('')
  const [newCustAddress, setNewCustAddress] = useState('')
  const [newCustEmail, setNewCustEmail] = useState('')

  const [validationError, setValidationError] = useState<string | null>(null)

  const handleReset = () => {
    setCustomerId('')
    setScheduledAt('')
    setNotes('')
    setIsAddingCustomer(false)
    setNewCustName('')
    setNewCustMobile('')
    setNewCustAddress('')
    setNewCustEmail('')
    setValidationError(null)
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  const handleCreateCustomerSubmit = async () => {
    setValidationError(null)
    const payload = {
      name: newCustName.trim(),
      mobile: newCustMobile.trim(),
      address: newCustAddress.trim(),
      email: newCustEmail.trim() || undefined
    }

    const parseResult = createCustomerSchema.safeParse(payload)
    if (!parseResult.success) {
      setValidationError(parseResult.error.errors[0]?.message || 'Invalid customer input')
      return
    }

    try {
      const created = await createCustomerMutation.mutateAsync(parseResult.data)
      setCustomerId(created.id)
      setIsAddingCustomer(false)
    } catch {
      // Error handled via mutation.error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    let isoScheduledAt: string | undefined = undefined
    if (scheduledAt) {
      const parsedDate = new Date(scheduledAt)
      if (isNaN(parsedDate.getTime())) {
        setValidationError('Invalid scheduled date/time')
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
      setValidationError(parseResult.error.errors[0]?.message || 'Invalid job form input')
      return
    }

    try {
      await createJobMutation.mutateAsync(parseResult.data)
      handleClose()
    } catch {
      // Error is caught and displayed by createJobMutation.error
    }
  }

  const customerSelectData = customers.map((c) => ({
    value: c.id,
    label: `${c.name} (${c.address})`
  }))

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={t('jobs.createTitle', 'Create Dispatch Job')}
      size="lg"
      centered
      radius="md"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <ApiErrorAlert error={createJobMutation.error || createCustomerMutation.error} />
          {validationError && (
            <ApiErrorAlert error={validationError} title="Validation Error" />
          )}

          {!isAddingCustomer ? (
            <Stack gap="xs">
              <Group justify="space-between" align="flex-end">
                <Select
                  label={t('jobs.customer', 'Customer')}
                  placeholder={
                    isLoadingCustomers
                      ? t('common.loading', 'Loading customers...')
                      : t('jobs.selectCustomer', 'Select a customer')
                  }
                  data={customerSelectData}
                  value={customerId}
                  onChange={(val) => setCustomerId(val || '')}
                  searchable
                  clearable
                  style={{ flex: 1 }}
                />
                <Button
                  variant="light"
                  leftSection={<Plus size={16} />}
                  onClick={() => setIsAddingCustomer(true)}
                >
                  {t('jobs.addCustomer', 'New Customer')}
                </Button>
              </Group>
            </Stack>
          ) : (
            <Stack gap="xs" style={{ border: '1px dashed var(--mantine-color-gray-4)', padding: '12px', borderRadius: '8px' }}>
              <Group justify="space-between">
                <Text size="sm" fw={700}>
                  {t('jobs.createCustomerTitle', 'Create New Customer')}
                </Text>
                <Button variant="subtle" size="xs" onClick={() => setIsAddingCustomer(false)}>
                  {t('common.cancel', 'Cancel')}
                </Button>
              </Group>
              <TextInput
                label={t('jobs.customerName', 'Customer Name')}
                value={newCustName}
                onChange={(e) => setNewCustName(e.target.value)}
                placeholder="Acme Corp"
              />
              <TextInput
                label={t('jobs.customerMobile', 'Phone Number')}
                value={newCustMobile}
                onChange={(e) => setNewCustMobile(e.target.value)}
                placeholder="+1 555-0192"
              />
              <TextInput
                label={t('jobs.customerAddress', 'Address')}
                value={newCustAddress}
                onChange={(e) => setNewCustAddress(e.target.value)}
                placeholder="100 Main St, Suite 400"
              />
              <TextInput
                label={t('jobs.customerEmail', 'Email (Optional)')}
                value={newCustEmail}
                onChange={(e) => setNewCustEmail(e.target.value)}
                placeholder="contact@acme.com"
              />
              <Button
                size="xs"
                variant="filled"
                loading={createCustomerMutation.isPending}
                onClick={handleCreateCustomerSubmit}
              >
                {t('jobs.saveCustomer', 'Save Customer')}
              </Button>
            </Stack>
          )}

          <TextInput
            label={t('jobs.scheduledAt', 'Scheduled Date & Time')}
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
          />

          <Textarea
            label={t('jobs.notes', 'Job Notes / Description')}
            placeholder={t('jobs.notesPlaceholder', 'Enter job service details or instructions')}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />

          <Group justify="flex-end" gap="xs" mt="sm">
            <Button variant="default" onClick={handleClose}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              type="submit"
              loading={createJobMutation.isPending}
              disabled={isAddingCustomer}
            >
              {t('jobs.createSubmit', 'Create Dispatch Job')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}
