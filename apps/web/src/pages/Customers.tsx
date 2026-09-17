import React, { useState } from 'react'
import { Button, Container, Stack } from '@mantine/core'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useAppTheme } from '../app/theme/ThemeContext'
import { PageHeader } from '../components/common/PageHeader'
import { CustomerFormModal } from '../components/customers/Form'
import { CustomerList } from '../components/customers/List'

export const Customers: React.FC = () => {
  const { t } = useTranslation()
  const { primaryColor } = useAppTheme()

  const [createModalOpened, setCreateModalOpened] = useState(false)

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
            <Button
              leftSection={<Plus size={16} />}
              color={primaryColor}
              onClick={() => setCreateModalOpened(true)}
            >
              {t('common.new', 'New')}
            </Button>
          }
        />

        <CustomerList />

        <CustomerFormModal opened={createModalOpened} onClose={() => setCreateModalOpened(false)} />
      </Stack>
    </Container>
  )
}

export default Customers
