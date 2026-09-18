import React from 'react'
import { ActionIcon, Anchor, Box, Button, Container, Group, Title } from '@mantine/core'
import { Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { useAppTheme } from '../../app/theme/ThemeContext'
import { Logo } from '../common/Logo'

const NAV_ITEMS: { key: string; hash: string }[] = [
  { key: 'features', hash: '#features' },
  { key: 'howItWorks', hash: '#how-it-works' },
  { key: 'about', hash: '#about' },
  { key: 'pricing', hash: '#pricing' }
]

export const LandingHeader: React.FC = () => {
  const { t } = useTranslation()
  const { colorScheme, toggleColorScheme, primaryColor } = useAppTheme()

  return (
    <Box
      component="header"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'var(--mantine-color-body)',
        borderBottom: '1px solid var(--mantine-color-default-border)'
      }}
    >
      <Container fluid px={{ base: 'sm', sm: 'md', lg: 'lg' }} py="sm">
        <Group justify="space-between" align="center" gap="md">
          <Group gap="xs" wrap="nowrap">
            <ActionIcon color={primaryColor} size="lg" radius="md" variant="filled">
              <Logo size={22} color="currentColor" />
            </ActionIcon>
            <Title order={4} lh={1.1}>
              {t('app.name')}
            </Title>
          </Group>

          <Group gap="lg" visibleFrom="sm" align="center">
            {NAV_ITEMS.map((item) => (
              <Anchor
                key={item.key}
                href={item.hash}
                underline="hover"
                fw={500}
                size="sm"
                c="var(--mantine-color-text)"
              >
                {t(`landing.nav.${item.key}`)}
              </Anchor>
            ))}
          </Group>

          <Group gap="xs" align="center" wrap="nowrap">
            <ActionIcon
              variant="default"
              size="lg"
              radius="md"
              onClick={toggleColorScheme}
              aria-label="Toggle color scheme"
            >
              {colorScheme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </ActionIcon>
            <Button variant="subtle" component={Link} to="/login">
              {t('landing.nav.signIn')}
            </Button>
            <Button component={Link} to="/register">
              {t('landing.nav.startTrial')}
            </Button>
          </Group>
        </Group>
      </Container>
    </Box>
  )
}

export default LandingHeader
