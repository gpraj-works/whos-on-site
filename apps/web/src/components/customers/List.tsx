import React, { useState } from 'react'
import { Card, Group, Paper, Stack, Table, Text, TextInput } from '@mantine/core'
import { Mail, MapPin, Phone, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { CustomerDto, formatDate } from '@whosonsite/shared'
import { ApiErrorAlert, ConfirmDialog } from '../feedback'
import { CustomerFormModal } from './Form'
import { useCustomers, useDeleteCustomer } from './queries'
import { Edit2, Trash2 } from 'lucide-react'
import { ActionIcon, Tooltip } from '@mantine/core'

export const CustomerList: React.FC = () => {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')

  const { data: customers = [], isLoading, error } = useCustomers()
  const deleteCustomerMutation = useDeleteCustomer()

  const [customerToEdit, setCustomerToEdit] = useState<CustomerDto | null>(null)
  const [customerToDelete, setCustomerToDelete] = useState<CustomerDto | null>(null)

  const filteredCustomers = customers.filter((c) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      c.mobile.toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q) ||
      (c.email && c.email.toLowerCase().includes(q))
    )
  })

  const handleDeleteConfirm = async () => {
    if (!customerToDelete) return
    try {
      await deleteCustomerMutation.mutateAsync(customerToDelete.id)
      setCustomerToDelete(null)
    } catch {
      // Error handled by ApiErrorAlert (if we added it, but here it's caught globally or by mutation)
    }
  }

  return (
    <Stack gap="sm">
      <ApiErrorAlert error={error} />

      <Paper p="sm" radius="md" withBorder>
        <Group justify="space-between" align="center">
          <TextInput
            placeholder={t('common.search', 'Search customer name, phone, address, email...')}
            leftSection={<Search size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, maxWidth: 400 }}
          />
          <Text size="xs" c="dimmed">
            Total Customers: {customers.length}
          </Text>
        </Group>
      </Paper>

      <Card radius="md" withBorder shadow="xs" p="0">
        <Table.ScrollContainer minWidth={800}>
          <Table highlightOnHover verticalSpacing="md" horizontalSpacing="md">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t('customers.name', 'Customer Name')}</Table.Th>
                <Table.Th>{t('customers.phone', 'Phone Number')}</Table.Th>
                <Table.Th>{t('customers.address', 'Address')}</Table.Th>
                <Table.Th>{t('customers.email', 'Email')}</Table.Th>
                <Table.Th>{t('customers.createdAt', 'Created At')}</Table.Th>
                <Table.Th w={100} ta="right">
                  {t('common.actions', 'Actions')}
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {isLoading ? (
                <Table.Tr>
                  <Table.Td colSpan={5} ta="center" py="xl">
                    <Text size="sm" c="dimmed">
                      {t('common.loading', 'Loading customers...')}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : filteredCustomers.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={6} ta="center" py="xl">
                    <Text size="sm" c="dimmed">
                      {t('common.noData', 'No customers found.')}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <Table.Tr key={customer.id}>
                    <Table.Td>
                      <Text size="sm" fw={700}>
                        {customer.name}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={6}>
                        <Phone size={14} style={{ opacity: 0.6 }} />
                        <Text size="xs">{customer.mobile}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={6}>
                        <MapPin size={14} style={{ opacity: 0.6 }} />
                        <Text size="xs">{customer.address}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      {customer.email ? (
                        <Group gap={6}>
                          <Mail size={14} style={{ opacity: 0.6 }} />
                          <Text size="xs">{customer.email}</Text>
                        </Group>
                      ) : (
                        <Text size="xs" c="dimmed">
                          N/A
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" c="dimmed">
                        {formatDate(customer.createdAt)}
                      </Text>
                    </Table.Td>
                    <Table.Td ta="right">
                      <Group gap="xs" justify="flex-end" wrap="nowrap">
                        <Tooltip label={t('common.edit', 'Edit')}>
                          <ActionIcon
                            variant="light"
                            onClick={() => setCustomerToEdit(customer)}
                            color="blue"
                            size="sm"
                          >
                            <Edit2 size={14} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label={t('common.delete', 'Delete')}>
                          <ActionIcon
                            variant="light"
                            color="red"
                            onClick={() => setCustomerToDelete(customer)}
                            size="sm"
                          >
                            <Trash2 size={14} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Card>

      <CustomerFormModal
        opened={!!customerToEdit}
        onClose={() => setCustomerToEdit(null)}
        customer={customerToEdit || undefined}
      />

      <ConfirmDialog
        opened={!!customerToDelete}
        onClose={() => setCustomerToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title={t('customers.deleteTitle', 'Delete Customer')}
        message={t(
          'customers.deleteMessage',
          'Are you sure you want to delete this customer? This action cannot be undone.'
        )}
        confirmLabel={t('common.delete', 'Delete')}
        confirmColor="red"
        isLoading={deleteCustomerMutation.isPending}
        error={deleteCustomerMutation.error}
      />
    </Stack>
  )
}
