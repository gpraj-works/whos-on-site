import React from 'react'
import {
  Button,
  Card,
  ColorSwatch,
  Container,
  Divider,
  Group,
  Stack,
  Text,
  Title
} from '@mantine/core'
import { ThemeColorType } from '@whosonsite/shared'
import { Check, Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useAppTheme } from '../app/theme/ThemeContext'
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
  const { t } = useTranslation()
  const { colorScheme, toggleColorScheme, primaryColor, setPrimaryColor, themeColors } =
    useAppTheme()

  return (
    <Container fluid p={0}>
      <Stack gap="sm">
        <PageHeader title={t('nav.settings')} subtitle="Theme colors and application preferences" />

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
          </Stack>
        </Card>
      </Stack>
    </Container>
  )
}

export default Settings
