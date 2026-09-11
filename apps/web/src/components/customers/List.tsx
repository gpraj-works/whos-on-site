import React, { useState } from 'react'
import { Card, Group, Paper, Table, Text, TextInput } from '@mantine/core'
import { Mail, MapPin, Phone, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { formatDate } from '../../lib/date/format'
import { ApiErrorAlert } from '../feedback/ApiErrorAlert'
import { useCustomers } from './queries'

export const CustomerList: React.FC = () => {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')

  const { data: customers = [], isLoading, error } = useCustomers()

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

  return (
    <>
      <ApiErrorAlert error={error} />

      <Paper p="md" radius="md" withBorder mb="md">
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
        <Table highlightOnHover verticalSpacing="md" horizontalSpacing="md">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t('customers.name', 'Customer Name')}</Table.Th>
              <Table.Th>{t('customers.phone', 'Phone Number')}</Table.Th>
              <Table.Th>{t('customers.address', 'Address')}</Table.Th>
              <Table.Th>{t('customers.email', 'Email')}</Table.Th>
              <Table.Th>{t('customers.createdAt', 'Created At')}</Table.Th>
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
                <Table.Td colSpan={5} ta="center" py="xl">
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
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Card>
    </>
  )
}
