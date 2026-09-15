import React, { useState } from 'react'
import { Button, Container, Stack } from '@mantine/core'
import { UserRole } from '@whosonsite/shared'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useAppTheme } from '../app/theme/ThemeContext'
import { useAuth } from '../components/auth/AuthContext'
import { PageHeader } from '../components/common/PageHeader'
import { CreateTechnicianModal } from '../components/technicians/Form'
import { TechnicianList } from '../components/technicians/List'

export const Technicians: React.FC = () => {
  const { t } = useTranslation()
  const { primaryColor } = useAppTheme()
  const { user } = useAuth()
  const [createModalOpened, setCreateModalOpened] = useState(false)

  const isManagementRole = user?.role === UserRole.OWNER || user?.role === UserRole.ADMIN

  return (
    <Container fluid p={0}>
      <Stack gap="sm">
        <PageHeader
          title={t('nav.technicians', 'Field Technicians')}
          subtitle={t(
            'technicians.subtitle',
            'Real-time technician availability, status tracking, and location dispatch readiness'
          )}
          actions={
            isManagementRole ? (
              <Button
                leftSection={<Plus size={16} />}
                color={primaryColor}
                onClick={() => setCreateModalOpened(true)}
              >
                {t('common.new', 'New')}
              </Button>
            ) : undefined
          }
        />

        <TechnicianList />

        <CreateTechnicianModal
          opened={createModalOpened}
          onClose={() => setCreateModalOpened(false)}
        />
      </Stack>
    </Container>
  )
}

export default Technicians
