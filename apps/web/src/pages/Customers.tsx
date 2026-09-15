import React, { useState } from 'react'
import { Button, Container, Group, Stack } from '@mantine/core'
import { Plus, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useAppTheme } from '../app/theme/ThemeContext'
import { PageHeader } from '../components/common/PageHeader'
import { CreateCustomerModal } from '../components/customers/Form'
import { CustomerList } from '../components/customers/List'
import { useCustomers } from '../components/customers/queries'

export const Customers: React.FC = () => {
  const { t } = useTranslation()
  const { primaryColor } = useAppTheme()

  const [createModalOpened, setCreateModalOpened] = useState(false)
  const { refetch } = useCustomers()

  return (
    <Container fluid p={0}>
      <Stack gap="sm">
        <PageHeader
          title={t('nav.customers', 'Customers')}
          subtitle={t(
            'customers.subtitle',
            'Manage company customer accounts and service locations'
          )}
          actions={
            <Group gap="xs">
              <Button
                variant="default"
                leftSection={<RefreshCw size={16} />}
                onClick={() => refetch()}
              >
                {t('common.refresh', 'Refresh')}
              </Button>
              <Button
                leftSection={<Plus size={16} />}
                color={primaryColor}
                onClick={() => setCreateModalOpened(true)}
              >
                {t('common.new', 'New')}
              </Button>
            </Group>
          }
        />

        <CustomerList />

        <CreateCustomerModal
          opened={createModalOpened}
          onClose={() => setCreateModalOpened(false)}
        />
      </Stack>
    </Container>
  )
}

export default Customers
