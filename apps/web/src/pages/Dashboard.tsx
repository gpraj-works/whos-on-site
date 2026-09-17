import React from 'react'
import { Container, Stack } from '@mantine/core'
import { UserRole } from '@whosonsite/shared'
import { useTranslation } from 'react-i18next'

import { useAuth } from '../components/auth/AuthContext'
import { AgentDashboard } from '../components/dashboard/AgentDashboard'
import { ManagementDashboard } from '../components/dashboard/ManagementDashboard'
import { PageHeader } from '../components/common/PageHeader'

export const Dashboard: React.FC = () => {
  const { t } = useTranslation()
  const { user } = useAuth()

  const isAgent = user?.role === UserRole.AGENT

  return (
    <Container fluid p={0}>
      <Stack gap="xs">
        <PageHeader
          title={
            isAgent
              ? t('dashboard.myDashboardTitle', 'My Dashboard')
              : t('dashboard.title', 'Dashboard')
          }
          subtitle={
            isAgent
              ? t('dashboard.agentSubtitle', 'Your job schedule and performance at a glance')
              : t(
                  'dashboard.managementSubtitle',
                  'Company-wide dispatch and field operations overview'
                )
          }
        />
        {isAgent ? <AgentDashboard /> : <ManagementDashboard />}
      </Stack>
    </Container>
  )
}

export default Dashboard
