import React from 'react'
import {
  AppShell,
  Group,
  Title,
  Select,
  Text,
  Badge,
  Container,
  Paper,
  Stack,
  ThemeIcon
} from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { Navigation, Server, ShieldCheck } from 'lucide-react'
import { SUPPORTED_LOCALES } from '../../app/i18n/locales.js'

export const AppLayout: React.FC<{ children?: React.ReactNode }> = () => {
  const { t, i18n } = useTranslation(['common', 'jobs'])

  const handleLanguageChange = (value: string | null) => {
    if (value) {
      i18n.changeLanguage(value)
    }
  }

  return (
    <AppShell header={{ height: 70 }} padding="md">
      <AppShell.Header p="md">
        <Group justify="space-between" h="100%">
          <Group gap="xs">
            <ThemeIcon
              size="lg"
              radius="md"
              variant="gradient"
              gradient={{ from: 'teal', to: 'indigo' }}
            >
              <Navigation size={22} />
            </ThemeIcon>
            <Title order={3} style={{ letterSpacing: '-0.5px' }}>
              {t('appName')}
            </Title>
            <Badge variant="light" color="teal" size="sm">
              Phase 1
            </Badge>
          </Group>

          <Group gap="md">
            <Select
              size="xs"
              value={i18n.language}
              onChange={handleLanguageChange}
              data={SUPPORTED_LOCALES.map((l) => ({ value: l.code, label: l.label }))}
              style={{ width: 120 }}
            />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main style={{ backgroundColor: 'var(--mantine-color-dark-8)' }}>
        <Container size="lg" py="xl">
          <Stack gap="lg">
            <Paper
              p="xl"
              radius="md"
              withBorder
              style={{ backgroundColor: 'var(--mantine-color-dark-7)' }}
            >
              <Stack gap="sm">
                <Group justify="space-between">
                  <Group gap="sm">
                    <ThemeIcon color="teal" variant="light" size="xl">
                      <ShieldCheck size={28} />
                    </ThemeIcon>
                    <div>
                      <Title order={2}>{t('appName')}</Title>
                      <Text c="dimmed" size="sm">
                        {t('tagline')}
                      </Text>
                    </div>
                  </Group>
                  <Badge size="lg" color="indigo" variant="outline">
                    Foundations & Data Layer Ready
                  </Badge>
                </Group>

                <Text size="sm" mt="md">
                  Monorepo foundation successfully initialized with <strong>React 19</strong>,{' '}
                  <strong>Mantine UI</strong>, <strong>Express API</strong>,{' '}
                  <strong>Drizzle ORM</strong>, <strong>PostGIS Spatial Schema</strong>,{' '}
                  <strong>Pino Logger</strong>, and <strong>i18n (English / Tamil)</strong>.
                </Text>
              </Stack>
            </Paper>

            <Paper
              p="lg"
              radius="md"
              withBorder
              style={{ backgroundColor: 'var(--mantine-color-dark-7)' }}
            >
              <Group justify="space-between" mb="md">
                <Group gap="xs">
                  <Server size={18} />
                  <Text fw={600}>API Health & Infrastructure Endpoints</Text>
                </Group>
              </Group>
              <Group gap="md">
                <Badge variant="filled" color="teal" radius="sm">
                  GET /health (Liveness)
                </Badge>
                <Badge variant="filled" color="blue" radius="sm">
                  GET /ready (PostgreSQL + Redis Readiness)
                </Badge>
              </Group>
            </Paper>
          </Stack>
        </Container>
      </AppShell.Main>
    </AppShell>
  )
}
