import React from 'react'
import { Button, Container, Stack } from '@mantine/core'
import { RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { PageHeader } from '../components/common/PageHeader'
import { TechnicianList } from '../components/technicians/List'
import { useTechnicians } from '../components/technicians/queries'

export const Technicians: React.FC = () => {
  const { t } = useTranslation()
  const { refetch } = useTechnicians()

  return (
    <Container size="xl" py="lg">
      <Stack gap="lg">
        <PageHeader
          title={t('nav.technicians', 'Field Technicians')}
          subtitle={t(
            'technicians.subtitle',
            'Real-time technician availability, status tracking, and location dispatch readiness'
          )}
          actions={
            <Button
              variant="default"
              leftSection={<RefreshCw size={16} />}
              onClick={() => refetch()}
            >
              {t('common.refresh', 'Refresh')}
            </Button>
          }
        />

        <TechnicianList />
      </Stack>
    </Container>
  )
}

export default Technicians
