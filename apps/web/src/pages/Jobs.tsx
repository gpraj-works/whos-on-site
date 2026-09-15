import React, { useState } from 'react'
import { Button, Container, Stack } from '@mantine/core'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useAppTheme } from '../app/theme/ThemeContext'
import { PageHeader } from '../components/common/PageHeader'
import { CreateJobModal } from '../components/jobs/Form'
import { JobList } from '../components/jobs/List'

export const Jobs: React.FC = () => {
  const { t } = useTranslation()
  const { primaryColor } = useAppTheme()

  const [createModalOpened, setCreateModalOpened] = useState(false)

  return (
    <Container fluid p={0}>
      <Stack gap="sm">
        <PageHeader
          title={t('nav.jobs', 'Dispatch')}
          subtitle={t(
            'jobs.subtitle',
            'Manage job assignments, status state machine, and customer dispatches'
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

        <JobList />

        <CreateJobModal opened={createModalOpened} onClose={() => setCreateModalOpened(false)} />
      </Stack>
    </Container>
  )
}

export default Jobs
