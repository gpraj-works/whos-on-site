import React from 'react'
import {
  Badge,
  Button,
  Card,
  ColorSwatch,
  Divider,
  Grid,
  Group,
  Paper,
  Radio,
  Stack,
  Text,
  Title
} from '@mantine/core'
import { ThemeColorType } from '@routeboard/shared'
import { Building2, Check, Moon, Sun, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useAppTheme } from '../app/theme/ThemeContext'
import { PageHeader } from '../components/common/PageHeader'
import { useAuth } from '../features/auth/context/AuthContext'

const SWATCH_HEX_MAP: Record<ThemeColorType, string> = {
  teal: '#12b886',
  indigo: '#4c6ef5',
  blue: '#228be6',
  violet: '#7950f2',
  orange: '#fd7e14',
  green: '#40c057'
}

export const SettingsPage: React.FC = () => {
  const { t, i18n } = useTranslation()
  const { colorScheme, toggleColorScheme, primaryColor, setPrimaryColor, themeColors } = useAppTheme()
  const { user, company } = useAuth()

  return (
    <Stack gap="xl">
      <PageHeader
        title={t('nav.settings')}
        description="Manage your personal preferences and company tenant branding."
      />

      {/* Section 1: User Profile Settings */}
      <Paper p="lg" radius="md">
        <Group align="center" mb="md">
          <User size={22} color="var(--mantine-primary-color-filled)" />
          <Title order={4}>User Profile (Personal Preferences)</Title>
        </Group>

        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card p="md" radius="sm">
              <Stack gap="xs">
                <Text size="xs" c="dimmed" fw={600} tt="uppercase">
                  Email Address
                </Text>
                <Text fw={600}>{user?.email || 'N/A'}</Text>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card p="md" radius="sm">
              <Stack gap="xs">
                <Text size="xs" c="dimmed" fw={600} tt="uppercase">
                  Role Permission
                </Text>
                <Group gap="xs">
                  <Badge size="md" color={primaryColor} tt="uppercase">
                    {user?.role || 'N/A'}
                  </Badge>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        <Divider my="lg" />

        {/* User Theme Mode & Language */}
        <Grid align="center">
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Stack gap="xs">
              <Text size="sm" fw={600}>
                {t('theme.colorScheme')} Mode:
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
              <Text size="sm" fw={600}>
                {t('language.selectLanguage')}:
              </Text>
              <Radio.Group
                value={i18n.language}
                onChange={(val) => i18n.changeLanguage(val)}
                name="userLanguage"
              >
                <Group mt={4}>
                  <Radio value="en" label={t('language.english')} />
                  <Radio value="ta" label={t('language.tamil')} />
                </Group>
              </Radio.Group>
            </Stack>
          </Grid.Col>
        </Grid>
      </Paper>

      {/* Section 2: Company Tenant Settings */}
      <Paper p="lg" radius="md">
        <Group align="center" mb="md">
          <Building2 size={22} color="var(--mantine-primary-color-filled)" />
          <Title order={4}>Company Branding (Tenant Preferences)</Title>
        </Group>

        <Grid mb="md">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card p="md" radius="sm">
              <Stack gap="xs">
                <Text size="xs" c="dimmed" fw={600} tt="uppercase">
                  Company Name
                </Text>
                <Text fw={600}>{company?.name || 'N/A'}</Text>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card p="md" radius="sm">
              <Stack gap="xs">
                <Text size="xs" c="dimmed" fw={600} tt="uppercase">
                  Tenant ID
                </Text>
                <Text fw={600} size="sm" style={{ fontFamily: 'monospace' }}>
                  {company?.id || 'N/A'}
                </Text>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        <Stack gap="xs">
          <Text size="sm" fw={600}>
            {t('theme.primaryColor')} (Active: <Text span tt="capitalize" fw={700}>{primaryColor}</Text>):
          </Text>
          <Group gap="md">
            {themeColors.map((color) => (
              <Group key={color} gap={6} style={{ cursor: 'pointer' }} onClick={() => setPrimaryColor(color)}>
                <ColorSwatch color={SWATCH_HEX_MAP[color]} size={28}>
                  {primaryColor === color && <Check size={16} color="#fff" />}
                </ColorSwatch>
                <Text size="sm" tt="capitalize">
                  {color}
                </Text>
              </Group>
            ))}
          </Group>
        </Stack>
      </Paper>
    </Stack>
  )
}
