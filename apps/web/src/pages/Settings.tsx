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
import { ThemeColorType } from '@whosonsite/shared'
import { Building2, Check, Moon, Sun, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useAppTheme } from '../app/theme/ThemeContext'
import { useAuth } from '../components/auth/AuthContext'
import { PageHeader } from '../components/common/PageHeader'

const SWATCH_HEX_MAP: Record<ThemeColorType, string> = {
  teal: '#12b886',
  indigo: '#4c6ef5',
  blue: '#228be6',
  violet: '#7950f2',
  orange: '#fd7e14',
  green: '#40c057'
}

export const Settings: React.FC = () => {
  const { t, i18n } = useTranslation()
  const { colorScheme, toggleColorScheme, primaryColor, setPrimaryColor, themeColors } =
    useAppTheme()
  const { user, company } = useAuth()

  return (
    <Stack gap="xl">
      <PageHeader
        title={t('nav.settings')}
        subtitle="Manage user profile, theme colors, and application preferences"
      />

      <Grid>
        {/* Left Side: Theme & Appearance Settings */}
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Card radius="md" withBorder p="lg">
            <Stack gap="md">
              <Title order={4}>{t('theme.title')}</Title>
              <Text size="sm" c="dimmed">
                Customize WhosOnSite visual mode and brand color palette
              </Text>

              <Divider my="xs" />

              <div>
                <Text size="sm" fw={600} mb="xs">
                  {t('theme.colorScheme')}
                </Text>
                <Group gap="md">
                  <Button
                    variant={colorScheme === 'light' ? 'filled' : 'default'}
                    color={primaryColor}
                    leftSection={<Sun size={18} />}
                    onClick={toggleColorScheme}
                  >
                    {t('theme.lightMode')}
                  </Button>

                  <Button
                    variant={colorScheme === 'dark' ? 'filled' : 'default'}
                    color={primaryColor}
                    leftSection={<Moon size={18} />}
                    onClick={toggleColorScheme}
                  >
                    {t('theme.darkMode')}
                  </Button>
                </Group>
              </div>

              <Divider my="xs" />

              <div>
                <Text size="sm" fw={600} mb="xs">
                  {t('theme.primaryColor')}
                </Text>
                <Group gap="sm" mt="xs">
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
              </div>

              <Divider my="xs" />

              <div>
                <Text size="sm" fw={600} mb="xs">
                  {t('language.selectLanguage')}
                </Text>
                <Radio.Group value={i18n.language} onChange={(val) => i18n.changeLanguage(val)}>
                  <Group gap="lg" mt="xs">
                    <Radio value="en" label={t('language.english')} color={primaryColor} />
                    <Radio value="ta" label={t('language.tamil')} color={primaryColor} />
                  </Group>
                </Radio.Group>
              </div>
            </Stack>
          </Card>
        </Grid.Col>

        {/* Right Side: Account & Company Profile */}
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Stack gap="md">
            <Card radius="md" withBorder p="lg">
              <Group justify="space-between" mb="xs">
                <Title order={4}>Authenticated User</Title>
                <Badge color={primaryColor}>{user?.role}</Badge>
              </Group>

              <Group gap="sm" mt="sm">
                <User size={20} style={{ opacity: 0.6 }} />
                <div>
                  <Text size="xs" c="dimmed">
                    Email Account
                  </Text>
                  <Text size="sm" fw={600}>
                    {user?.email}
                  </Text>
                </div>
              </Group>
            </Card>

            <Card radius="md" withBorder p="lg">
              <Title order={4} mb="xs">
                Active Organization
              </Title>

              <Stack gap="xs" mt="sm">
                <Group gap="sm">
                  <Building2 size={20} style={{ opacity: 0.6 }} />
                  <div>
                    <Text size="xs" c="dimmed">
                      Company Name
                    </Text>
                    <Text size="sm" fw={600}>
                      {company?.name || 'WhosOnSite Organization'}
                    </Text>
                  </div>
                </Group>

                <Paper p="xs" bg="var(--mantine-color-body)" withBorder mt="xs">
                  <Text size="xs" c="dimmed">
                    Company ID:
                  </Text>
                  <Text size="xs" fw={700} style={{ fontFamily: 'monospace' }}>
                    {company?.id || user?.companyId}
                  </Text>
                </Paper>
              </Stack>
            </Card>
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  )
}

export default Settings
