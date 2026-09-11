import React from 'react'
import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Burger,
  ColorSwatch,
  Group,
  Menu,
  Text,
  Title,
  Tooltip,
  UnstyledButton
} from '@mantine/core'
import { ThemeColorType } from '@routeboard/shared'
import { Globe, LogOut, Moon, Settings, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { useAppTheme } from '../../app/theme/ThemeContext'
import { useAuth } from '../../features/auth/context/AuthContext'
import { Logo } from '../common/Logo'

interface AppHeaderProps {
  mobileOpened: boolean
  toggleMobile: () => void
}

const SWATCH_HEX_MAP: Record<ThemeColorType, string> = {
  teal: '#12b886',
  indigo: '#4c6ef5',
  blue: '#228be6',
  violet: '#7950f2',
  orange: '#fd7e14',
  green: '#40c057'
}

export const AppHeader: React.FC<AppHeaderProps> = ({ mobileOpened, toggleMobile }) => {
  const { t, i18n } = useTranslation()
  const { colorScheme, toggleColorScheme, primaryColor, setPrimaryColor, themeColors } = useAppTheme()
  const { user, company, logout } = useAuth()

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  const companyName = company?.name || 'RouteBoard'

  return (
    <Group
      h="100%"
      px={{ base: 'xs', sm: 'md' }}
      justify="space-between"
      align="center"
      gap="md"
    >
      {/* Brand & Mobile Burger */}
      <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
        <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
        <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
          <ActionIcon color={primaryColor} size="lg" radius="md" variant="filled">
            <Logo size={22} color="currentColor" />
          </ActionIcon>
          <Box visibleFrom="xs" style={{ minWidth: 0 }}>
            <Title
              order={4}
              lh={1.1}
              maw={140}
              style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {t('app.name')}
            </Title>
            <Text
              size="xs"
              c="dimmed"
              lh={1.1}
              truncate
              maw={140}
            >
              {companyName}
            </Text>
          </Box>
        </Group>
      </Group>

      {/* Header Controls: Accent Swatches, Light/Dark Mode, Language Selector, User Menu */}
      <Group gap="xs" wrap="nowrap">
        {/* Company Primary Accent Color Swatches */}
        <Tooltip label={t('theme.primaryColor')}>
          <Group gap={6} visibleFrom="xs">
            {themeColors.map((color) => (
              <UnstyledButton key={color} onClick={() => setPrimaryColor(color)}>
                <ColorSwatch
                  color={SWATCH_HEX_MAP[color]}
                  size={18}
                  style={{
                    cursor: 'pointer',
                    outline: primaryColor === color ? '2px solid var(--mantine-primary-color-filled)' : 'none',
                    outlineOffset: 2
                  }}
                />
              </UnstyledButton>
            ))}
          </Group>
        </Tooltip>

        {/* Light / Dark Mode Toggle */}
        <Tooltip label={colorScheme === 'light' ? t('theme.darkMode') : t('theme.lightMode')}>
          <ActionIcon variant="default" size="lg" radius="md" onClick={toggleColorScheme}>
            {colorScheme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </ActionIcon>
        </Tooltip>

        {/* Language Selector (English / Tamil) */}
        <Menu shadow="md" width={160} position="bottom-end">
          <Menu.Target>
            <Tooltip label={t('language.selectLanguage')}>
              <ActionIcon variant="default" size="lg" radius="md">
                <Globe size={18} />
              </ActionIcon>
            </Tooltip>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>{t('language.selectLanguage')}</Menu.Label>
            <Menu.Item onClick={() => changeLanguage('en')}>
              {t('language.english')}
            </Menu.Item>
            <Menu.Item onClick={() => changeLanguage('ta')}>
              {t('language.tamil')}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>

        {/* User Account Menu */}
        {user && (
          <Menu shadow="md" width={200} position="bottom-end">
            <Menu.Target>
              <UnstyledButton style={{ cursor: 'pointer' }}>
                <Group gap="xs">
                  <Avatar radius="xl" size="sm" color={primaryColor}>
                    {user.email.charAt(0).toUpperCase()}
                  </Avatar>
                  <div style={{ display: 'none' }}>
                    <Text size="xs" fw={500}>
                      {user.email}
                    </Text>
                  </div>
                </Group>
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>
                <Text size="xs" fw={700} truncate>
                  {user.email}
                </Text>
                <Badge size="xs" variant="dot" color={primaryColor} tt="uppercase" mt={2}>
                  {user.role}
                </Badge>
              </Menu.Label>
              <Menu.Divider />
              <Menu.Item leftSection={<Settings size={14} />} component={Link} to="/settings">
                Settings
              </Menu.Item>
              <Menu.Item leftSection={<LogOut size={14} />} color="red" onClick={logout}>
                Sign Out
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
      </Group>
    </Group>
  )
}
