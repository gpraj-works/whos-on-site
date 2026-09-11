import React, { useState } from 'react'
import { Button, Group, Modal, Stack, TextInput } from '@mantine/core'
import { createCustomerSchema, CustomerDto } from '@whosonsite/shared'
import { useTranslation } from 'react-i18next'

import { ApiErrorAlert } from '../feedback/ApiErrorAlert'
import { useCreateCustomer } from './queries'

interface CreateCustomerModalProps {
  opened: boolean
  onClose: () => void
  onSuccess?: (customer: CustomerDto) => void
}

export const CreateCustomerModal: React.FC<CreateCustomerModalProps> = ({
  opened,
  onClose,
  onSuccess
}) => {
  const { t } = useTranslation()
  const createCustomerMutation = useCreateCustomer()

  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [address, setAddress] = useState('')
  const [email, setEmail] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleReset = () => {
    setName('')
    setMobile('')
    setAddress('')
    setEmail('')
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
      mobile: mobile.trim(),
      address: address.trim(),
      email: email.trim() || undefined
    }

    const parseResult = createCustomerSchema.safeParse(payload)
    if (!parseResult.success) {
      setValidationError(parseResult.error.errors[0]?.message || 'Invalid customer details')
      return
    }

    try {
      const created = await createCustomerMutation.mutateAsync(parseResult.data)
      handleClose()
      if (onSuccess) {
        onSuccess(created)
      }
    } catch {
      // Handled via createCustomerMutation.error
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={t('customers.createTitle', 'Add New Customer')}
      centered
      radius="md"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <ApiErrorAlert error={createCustomerMutation.error} />
          {validationError && <ApiErrorAlert error={validationError} title="Validation Error" />}

          <TextInput
            label={t('customers.name', 'Customer Name')}
            placeholder="Acme Corp"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <TextInput
            label={t('customers.phone', 'Phone Number')}
            placeholder="+1 555-0192"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />

          <TextInput
            label={t('customers.address', 'Service Address')}
            placeholder="100 Main St, Suite 400"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <TextInput
            label={t('customers.email', 'Email Address (Optional)')}
            placeholder="contact@acme.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Group justify="flex-end" gap="xs" mt="sm">
            <Button variant="default" onClick={handleClose}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button type="submit" loading={createCustomerMutation.isPending}>
              {t('customers.saveSubmit', 'Add')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}
