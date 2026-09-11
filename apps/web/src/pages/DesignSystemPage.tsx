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
import { JobStatus, TechnicianStatus, ThemeColorType } from '@routeboard/shared'
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

export const DesignSystemPage: React.FC = () => {
  const { t, i18n } = useTranslation()
  const { colorScheme, toggleColorScheme, primaryColor, setPrimaryColor, themeColors } = useAppTheme()

  const [confirmOpen, setConfirmOpen] = useState(false)
  const now = new Date()

  return (
    <Stack gap="xl">
      <PageHeader
        title={t('app.name') + ' — Design System & Foundation'}
        description={t('app.tagline')}
        action={
          <Button onClick={() => setConfirmOpen(true)} variant="filled">
            Open Confirm Dialog
          </Button>
        }
      />

      {/* Section 1: Theme & Color Palette */}
      <Paper p="md">
        <Title order={4} mb="sm">
          1. Multi-Tenant Theme & Color Palette
        </Title>
        <Text size="sm" c="dimmed" mb="md">
          Mantine built-in Light/Dark mode (User preference) + Company accent swatches (Server-owned per tenant).
        </Text>

        <Grid align="center">
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Stack gap="xs">
              <Text size="sm" fw={500}>
                {t('theme.colorScheme')}:
              </Text>
              <Group>
                <Button
                  leftSection={colorScheme === 'light' ? <Sun size={16} /> : <Moon size={16} />}
                  variant="outline"
                  onClick={toggleColorScheme}
                >
                  {colorScheme === 'light' ? t('theme.lightMode') : t('theme.darkMode')}
                </Button>
              </Group>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Stack gap="xs">
              <Text size="sm" fw={500}>
                {t('theme.primaryColor')} (Active: <Text span tt="capitalize" fw={700}>{primaryColor}</Text>):
              </Text>
              <Group gap="sm">
                {themeColors.map((color) => (
                  <Group key={color} gap={4} style={{ cursor: 'pointer' }} onClick={() => setPrimaryColor(color)}>
                    <ColorSwatch color={SWATCH_HEX_MAP[color]} size={24}>
                      {primaryColor === color && <Check size={14} color="#fff" />}
                    </ColorSwatch>
                    <Text size="xs" tt="capitalize">
                      {color}
                    </Text>
                  </Group>
                ))}
              </Group>
            </Stack>
          </Grid.Col>
        </Grid>
      </Paper>

      {/* Section 2: i18n Language Selector */}
      <Paper p="md">
        <Title order={4} mb="sm">
          2. Multi-Language i18n (English & தமிழ்)
        </Title>
        <Group>
          <Radio.Group
            value={i18n.language}
            onChange={(val) => i18n.changeLanguage(val)}
            name="languageSelector"
          >
            <Group mt="xs">
              <Radio value="en" label={t('language.english')} />
              <Radio value="ta" label={t('language.tamil')} />
            </Group>
          </Radio.Group>
        </Group>
      </Paper>

      {/* Section 3: Status Badges */}
      <Paper p="md">
        <Title order={4} mb="sm">
          3. Job & Technician Status Badges
        </Title>
        <Stack gap="sm">
          <Text size="sm" fw={500}>
            Job Lifecycle Badges:
          </Text>
          <Group gap="xs">
            <StatusBadge status={JobStatus.UNASSIGNED} size="md" />
            <StatusBadge status={JobStatus.ASSIGNED} size="md" />
            <StatusBadge status={JobStatus.EN_ROUTE} size="md" />
            <StatusBadge status={JobStatus.ON_SITE} size="md" />
            <StatusBadge status={JobStatus.COMPLETE} size="md" />
            <StatusBadge status={JobStatus.CANCELLED} size="md" />
          </Group>

          <Text size="sm" fw={500} mt="xs">
            Technician Status Badges:
          </Text>
          <Group gap="xs">
            <StatusBadge status={TechnicianStatus.AVAILABLE} size="md" />
            <StatusBadge status={TechnicianStatus.BUSY} size="md" />
            <StatusBadge status={TechnicianStatus.OFFLINE} size="md" />
          </Group>
        </Stack>
      </Paper>

      {/* Section 4: Day.js Formatted Timestamps */}
      <Paper p="md">
        <Title order={4} mb="sm">
          4. Standardized Date Handling (Day.js)
        </Title>
        <Grid>
          <Grid.Col span={{ base: 12, sm: 3 }}>
            <Card p="xs" radius="sm">
              <Text size="xs" c="dimmed">
                formatDate()
              </Text>
              <Text fw={600}>{formatDate(now)}</Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 3 }}>
            <Card p="xs" radius="sm">
              <Text size="xs" c="dimmed">
                formatDateTime()
              </Text>
              <Text fw={600}>{formatDateTime(now)}</Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 3 }}>
            <Card p="xs" radius="sm">
              <Text size="xs" c="dimmed">
                formatTime()
              </Text>
              <Text fw={600}>{formatTime(now)}</Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 3 }}>
            <Card p="xs" radius="sm">
              <Text size="xs" c="dimmed">
                formatRelative()
              </Text>
              <Text fw={600}>{formatRelative(now)}</Text>
            </Card>
          </Grid.Col>
        </Grid>
      </Paper>

      {/* Section 5: Reusable UI Components */}
      <Paper p="md">
        <Title order={4} mb="md">
          5. Reusable Common Components
        </Title>

        <Grid align="stretch">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card h="100%">
              <Title order={5} mb="xs">
                Form Fields & Actions
              </Title>
              <Stack gap="sm">
                <FormField label="Customer Name" required>
                  <TextInput placeholder="e.g. John Doe" />
                </FormField>
                <FormField label="Service Address" required error="Address is required">
                  <TextInput placeholder="e.g. 123 Main St" />
                </FormField>
                <FormActions onCancel={() => {}} submitLabel="Save Job" />
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="md" h="100%">
              <EmptyState title="No Jobs Assigned" description="Dispatch board currently has zero pending jobs." />
              <ErrorState message="Failed to connect to real-time dispatch server." onRetry={() => {}} />
            </Stack>
          </Grid.Col>
        </Grid>
      </Paper>

      {/* Confirm Dialog Modal */}
      <ConfirmDialog
        opened={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => setConfirmOpen(false)}
        title="Cancel Job"
        message="Are you sure you want to cancel this dispatch job? This action will be recorded in the status audit history."
        confirmLabel="Yes, Cancel Job"
      />
    </Stack>
  )
}
