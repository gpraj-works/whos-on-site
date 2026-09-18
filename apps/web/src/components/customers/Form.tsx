import React, { useState } from 'react'
import {
  Button,
  Group,
  Modal,
  Stack,
  TextInput
} from '@mantine/core'
import { createCustomerSchema, CustomerDto } from '@whosonsite/shared'
import { useTranslation } from 'react-i18next'

import { AddressPicker } from '../common/AddressPicker'
import { ApiErrorAlert } from '../feedback/ApiErrorAlert'
import MobileInput from '../shared/MobileInput'
import { useCreateCustomer, useUpdateCustomer } from './queries'

export interface CustomerFormModalProps {
  opened: boolean
  onClose: () => void
  onSuccess?: (customer: CustomerDto) => void
  zIndex?: number
  customer?: CustomerDto
}

interface CustomerFormContentProps {
  customer?: CustomerDto
  onClose: () => void
  onSuccess?: (customer: CustomerDto) => void
  zIndex?: number
}

function CustomerFormContent({ customer, onClose, onSuccess, zIndex }: CustomerFormContentProps) {
  const { t } = useTranslation()
  const createCustomerMutation = useCreateCustomer()
  const updateCustomerMutation = useUpdateCustomer()
  const isEditing = !!customer

  const [name, setName] = useState(customer?.name ?? '')
  const [mobile, setMobile] = useState(customer?.mobile ?? '')
  const [address, setAddress] = useState(customer?.address ?? '')
  const [email, setEmail] = useState(customer?.email ?? '')
  const [latitude, setLatitude] = useState<number | null>(customer?.latitude ?? null)
  const [longitude, setLongitude] = useState<number | null>(customer?.longitude ?? null)
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string
    mobile?: string
    address?: string
    email?: string
  }>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})

    const payload = {
      name: name.trim(),
      mobile: mobile.trim(),
      address: address.trim(),
      email: email.trim() || undefined,
      latitude,
      longitude
    }

    const parseResult = createCustomerSchema.safeParse(payload)
    if (!parseResult.success) {
      const formatted: { name?: string; mobile?: string; address?: string; email?: string } = {}
      parseResult.error.errors.forEach((err) => {
        const field = err.path[0] as 'name' | 'mobile' | 'address' | 'email'
        if (field && !formatted[field]) {
          formatted[field] = err.message
        }
      })
      setFieldErrors(formatted)
      return
    }

    try {
      let saved: CustomerDto
      if (isEditing && customer) {
        saved = await updateCustomerMutation.mutateAsync({
          id: customer.id,
          input: {
            name: name.trim(),
            mobile: mobile.trim(),
            address: address.trim(),
            email: email.trim() || undefined,
            latitude,
            longitude
          }
        })
      } else {
        saved = await createCustomerMutation.mutateAsync({
          name: name.trim(),
          mobile: mobile.trim(),
          address: address.trim(),
          email: email.trim() || undefined,
          latitude,
          longitude
        })
      }

      onSuccess?.(saved)
      onClose()
    } catch {
      // Handled by mutation error state
    }
  }

  const apiError = isEditing
    ? (updateCustomerMutation.error as Error | null)?.message
    : (createCustomerMutation.error as Error | null)?.message

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Stack gap="sm">
        {apiError && <ApiErrorAlert error={apiError} />}

        <TextInput
          label={t('customers.name', 'Customer / Business Name')}
          placeholder="Acme Corp"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }))
          }}
          withAsterisk
          error={fieldErrors.name}
        />

        <MobileInput
          label={t('customers.phone', 'Phone / Mobile')}
          placeholder="555 0192"
          value={mobile}
          onChange={(val) => {
            setMobile(val)
            if (fieldErrors.mobile) setFieldErrors((prev) => ({ ...prev, mobile: undefined }))
          }}
          withAsterisk
          error={fieldErrors.mobile}
        />

        <AddressPicker
          value={address}
          onChange={(val) => {
            setAddress(val)
            if (fieldErrors.address) setFieldErrors((prev) => ({ ...prev, address: undefined }))
          }}
          latitude={latitude}
          longitude={longitude}
          onCoordinatesChange={(lat, lng) => {
            setLatitude(lat)
            setLongitude(lng)
          }}
          label={t('customers.address', 'Service Address')}
          placeholder="Start typing to search addresses, or pin a location on the map"
          error={fieldErrors.address}
          withAsterisk
          zIndex={zIndex ? zIndex + 1 : 300}
        />

        <TextInput
          label={t('customers.email', 'Email Address (Optional)')}
          placeholder="contact@acme.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }))
          }}
          error={fieldErrors.email}
        />

        <Group justify="flex-end" gap="xs" mt="sm">
          <Button variant="default" onClick={onClose}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            type="submit"
            loading={
              isEditing ? updateCustomerMutation.isPending : createCustomerMutation.isPending
            }
          >
            {isEditing ? t('common.save', 'Save') : t('customers.saveSubmit', 'Add')}
          </Button>
        </Group>
      </Stack>
    </form>
  )
}

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  opened,
  onClose,
  onSuccess,
  zIndex,
  customer
}) => {
  const { t } = useTranslation()
  const isEditing = !!customer

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        isEditing
          ? t('customers.editTitle', 'Edit Customer')
          : t('customers.createTitle', 'New Customer')
      }
      centered
      radius="md"
      zIndex={zIndex}
    >
      {opened ? (
        <CustomerFormContent
          key={customer ? customer.id : 'new'}
          customer={customer}
          onClose={onClose}
          onSuccess={onSuccess}
          zIndex={zIndex}
        />
      ) : null}
    </Modal>
  )
}
