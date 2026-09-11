import React, { useState } from 'react'
import {
  Button,
  Card,
  ColorSwatch,
  Grid,
  Group,
  Paper,
  Radio,
  Stack,
  Text,
  TextInput,
  Title
} from '@mantine/core'
import { JobStatus, TechnicianStatus, ThemeColorType } from '@whosonsite/shared'
import { Check, Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useAppTheme } from '../app/theme/ThemeContext'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { EmptyState } from '../components/common/EmptyState'
import { ErrorState } from '../components/common/ErrorState'
import { PageHeader } from '../components/common/PageHeader'
import { StatusBadge } from '../components/common/StatusBadge'
import { FormActions } from '../components/forms/FormActions'
import { FormField } from '../components/forms/FormField'
import { formatDate, formatDateTime, formatRelative, formatTime } from '../lib/date'

const SWATCH_HEX_MAP: Record<ThemeColorType, string> = {
  teal: '#12b886',
  indigo: '#4c6ef5',
  blue: '#228be6',
  violet: '#7950f2',
  orange: '#fd7e14',
  green: '#40c057'
}

export const DesignSystem: React.FC = () => {
  const { t, i18n } = useTranslation()
  const { colorScheme, toggleColorScheme, primaryColor, setPrimaryColor, themeColors } =
    useAppTheme()

  const [confirmOpened, setConfirmOpened] = useState(false)
  const [formInput, setFormInput] = useState('')

  return (
    <Stack gap="xl">
      <PageHeader
        title="Design System & Theme Showcase"
        subtitle="Centralized Mantine UI components, tenant brand colors, and status badges"
      />

      {/* Section 1: Tenant Theme Swatches & Color Scheme */}
      <Card radius="md" withBorder p="lg">
        <Stack gap="md">
          <Title order={4}>Tenant Branding & Theme Colors</Title>

          <Group gap="md">
            <Button
              variant={colorScheme === 'light' ? 'filled' : 'default'}
              color={primaryColor}
              leftSection={<Sun size={18} />}
              onClick={toggleColorScheme}
            >
              Light Mode
            </Button>

            <Button
              variant={colorScheme === 'dark' ? 'filled' : 'default'}
              color={primaryColor}
              leftSection={<Moon size={18} />}
              onClick={toggleColorScheme}
            >
              Dark Mode
            </Button>
          </Group>

          <Text size="sm" fw={600} mt="xs">
            Select Company Brand Color:
          </Text>
          <Group gap="sm">
            {themeColors.map((color) => (
              <ColorSwatch
                key={color}
                color={SWATCH_HEX_MAP[color]}
                component="button"
                type="button"
                onClick={() => setPrimaryColor(color)}
                style={{ color: '#fff', cursor: 'pointer', border: 'none' }}
                aria-label={`${color} color swatch`}
              >
                {primaryColor === color && <Check size={16} />}
              </ColorSwatch>
            ))}
          </Group>
        </Stack>
      </Card>

      {/* Section 2: Status Badges */}
      <Card radius="md" withBorder p="lg">
        <Stack gap="md">
          <Title order={4}>Status Badges</Title>
          <Text size="sm" c="dimmed">
            Unified status badge components for jobs and technicians
          </Text>

          <Text size="sm" fw={600} mt="xs">
            Job Statuses:
          </Text>
          <Group gap="xs">
            <StatusBadge status={JobStatus.UNASSIGNED} />
            <StatusBadge status={JobStatus.ASSIGNED} />
            <StatusBadge status={JobStatus.EN_ROUTE} />
            <StatusBadge status={JobStatus.ON_SITE} />
            <StatusBadge status={JobStatus.COMPLETE} />
            <StatusBadge status={JobStatus.CANCELLED} />
          </Group>

          <Text size="sm" fw={600} mt="xs">
            Technician Availability Statuses:
          </Text>
          <Group gap="xs">
            <StatusBadge status={TechnicianStatus.AVAILABLE} />
            <StatusBadge status={TechnicianStatus.BUSY} />
            <StatusBadge status={TechnicianStatus.OFFLINE} />
          </Group>
        </Stack>
      </Card>

      {/* Section 3: Form Controls & Custom Input Wrappers */}
      <Card radius="md" withBorder p="lg">
        <Stack gap="md">
          <Title order={4}>Forms & Input Field Components</Title>

          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <FormField
                label="Technician Name"
                required
                error={formInput ? '' : 'Name is required'}
              >
                <TextInput
                  placeholder="Enter technician name"
                  value={formInput}
                  onChange={(e) => setFormInput(e.target.value)}
                />
              </FormField>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <FormField label="Service Address">
                <TextInput placeholder="123 Peachtree St, Atlanta, GA" />
              </FormField>
            </Grid.Col>
          </Grid>

          <FormActions onCancel={() => setFormInput('')} submitLabel="Save Configuration" />
        </Stack>
      </Card>

      {/* Section 4: States, Modals & Utility Views */}
      <Card radius="md" withBorder p="lg">
        <Stack gap="md">
          <Title order={4}>Empty States, Error States & Confirmation Dialogs</Title>

          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper p="md" withBorder radius="md">
                <EmptyState
                  title="No Active Dispatches"
                  description="There are currently no active field technician dispatches for today."
                  actionLabel="Create Dispatch"
                  onAction={() => alert('New Job Clicked')}
                />
              </Paper>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper p="md" withBorder radius="md">
                <ErrorState
                  title="Connection Timeout"
                  message="Failed to synchronize location ping with PostGIS server."
                  onRetry={() => alert('Retrying connection...')}
                />
              </Paper>
            </Grid.Col>
          </Grid>

          <Group justify="center" mt="md">
            <Button color="red" variant="light" onClick={() => setConfirmOpened(true)}>
              Open Confirmation Dialog Demo
            </Button>
          </Group>
        </Stack>
      </Card>

      {/* Section 5: Date & Time Formatters Showcase */}
      <Card radius="md" withBorder p="lg">
        <Stack gap="md">
          <Title order={4}>Localized Date & Time Formatters</Title>
          <Text size="sm" c="dimmed">
            Standardized dayjs formatters used across dispatch board and history timelines
          </Text>

          <Grid>
            <Grid.Col span={3}>
              <Text size="xs" c="dimmed">
                formatDate
              </Text>
              <Text fw={600}>{formatDate(new Date())}</Text>
            </Grid.Col>
            <Grid.Col span={3}>
              <Text size="xs" c="dimmed">
                formatDateTime
              </Text>
              <Text fw={600}>{formatDateTime(new Date())}</Text>
            </Grid.Col>
            <Grid.Col span={3}>
              <Text size="xs" c="dimmed">
                formatTime
              </Text>
              <Text fw={600}>{formatTime(new Date())}</Text>
            </Grid.Col>
            <Grid.Col span={3}>
              <Text size="xs" c="dimmed">
                formatRelative
              </Text>
              <Text fw={600}>{formatRelative(new Date())}</Text>
            </Grid.Col>
          </Grid>
        </Stack>
      </Card>

      {/* Section 6: Language Switching */}
      <Card radius="md" withBorder p="lg">
        <Stack gap="md">
          <Title order={4}>i18n Language Localization</Title>
          <Radio.Group
            value={i18n.language}
            onChange={(val) => i18n.changeLanguage(val)}
            label="Active Interface Language"
          >
            <Group gap="lg" mt="xs">
              <Radio value="en" label={t('language.english')} color={primaryColor} />
              <Radio value="ta" label={t('language.tamil')} color={primaryColor} />
            </Group>
          </Radio.Group>
        </Stack>
      </Card>

      <ConfirmDialog
        opened={confirmOpened}
        onClose={() => setConfirmOpened(false)}
        onConfirm={() => {
          alert('Action Confirmed!')
          setConfirmOpened(false)
        }}
        title="Confirm Cancellation"
        message="Are you sure you want to cancel this technician dispatch? This action is logged in audit history."
      />
    </Stack>
  )
}

export default DesignSystem
