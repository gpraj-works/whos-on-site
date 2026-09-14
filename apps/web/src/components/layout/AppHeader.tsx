import React from 'react'
import {
  ActionIcon,
  Badge,
  Box,
  Burger,
  Group,
  Menu,
  Text,
  Title,
  Tooltip
} from '@mantine/core'
import { LogOut, Moon, Settings, Sun, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { useAppTheme } from '../../app/theme/ThemeContext'
import { useAuth } from '../auth/AuthContext'
import { Logo } from '../common/Logo'

interface AppHeaderProps {
  mobileOpened: boolean
  toggleMobile: () => void
}

export const AppHeader: React.FC<AppHeaderProps> = ({ mobileOpened, toggleMobile }) => {
  const { t } = useTranslation()
  const { colorScheme, toggleColorScheme, primaryColor } = useAppTheme()
  const { user, logout } = useAuth()

  const companyName = useAuth().company?.name || 'WhosOnSite'

  return (
    <Group h="100%" px={{ base: 'xs', sm: 'md' }} justify="space-between" align="center" gap="md">
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
            <Text size="xs" c="dimmed" lh={1.1} truncate maw={140}>
              {companyName}
            </Text>
          </Box>
        </Group>
      </Group>

      {/* Header Controls */}
      <Group gap="xs" wrap="nowrap">
        {/* Light / Dark Mode Toggle */}
        <Tooltip label={colorScheme === 'light' ? t('theme.darkMode') : t('theme.lightMode')}>
          <ActionIcon variant="default" size="lg" radius="md" onClick={toggleColorScheme}>
            {colorScheme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </ActionIcon>
        </Tooltip>

        {/* User Account Menu */}
        {user && (
          <Menu shadow="md" width={200} position="bottom-end">
            <Menu.Target>
              <ActionIcon variant="default" size="lg" radius="md">
                <User size={18} />
              </ActionIcon>
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
              <Menu.Divider />
              <Menu.Item leftSection={<LogOut size={14} />} color="red" onClick={logout}>
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
      </Group>
    </Group>
  )
}
