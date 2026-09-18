import React from 'react'
import {
  ActionIcon,
  Anchor,
  Box,
  Container,
  Divider,
  Group,
  Stack,
  Text,
  Title
} from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { Logo } from '../common/Logo'

const PRODUCT_LINKS: { labelKey: string; hash: string }[] = [
  { labelKey: 'landing.nav.features', hash: '#features' },
  { labelKey: 'landing.nav.howItWorks', hash: '#how-it-works' },
  { labelKey: 'landing.nav.pricing', hash: '#pricing' }
]

export const LandingFooter: React.FC = () => {
  const { t } = useTranslation()

  return (
    <Box
      component="footer"
      style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}
      py="lg"
    >
      <Container fluid px={{ base: 'sm', sm: 'md', lg: 'lg' }}>
        <Group justify="space-between" align="flex-start" gap="xl" wrap="wrap">
          <Stack gap={4} style={{ maxWidth: 320 }}>
            <Group gap="xs" wrap="nowrap">
              <ActionIcon variant="filled" size="lg" radius="md" color="teal">
                <Logo size={22} color="currentColor" />
              </ActionIcon>
              <Title order={5} lh={1.1}>
                {t('app.name')}
              </Title>
            </Group>
            <Text size="sm" c="dimmed" lh={1.6}>
              {t('landing.footer.tagline')}
            </Text>
          </Stack>

          <Stack gap={6}>
            <Text size="xs" c="dimmed" fw={600} tt="uppercase">
              {t('landing.footer.product')}
            </Text>
            {PRODUCT_LINKS.map((link) => (
              <Anchor key={link.hash} href={link.hash} underline="hover" size="sm">
                {t(link.labelKey)}
              </Anchor>
            ))}
          </Stack>

          <Stack gap={6}>
            <Text size="xs" c="dimmed" fw={600} tt="uppercase">
              {t('landing.footer.getStarted')}
            </Text>
            <Anchor component={Link} to="/register" underline="hover" size="sm">
              {t('landing.footer.links.register')}
            </Anchor>
            <Anchor component={Link} to="/login" underline="hover" size="sm">
              {t('landing.footer.links.signIn')}
            </Anchor>
          </Stack>
        </Group>

        <Divider my="md" />

        <Group justify="space-between" gap="xs">
          <Text size="xs" c="dimmed">
            © {new Date().getFullYear()} {t('app.name')} · {t('landing.footer.rights')}
          </Text>
          <Text size="xs" c="dimmed">
            {t('landing.footer.madeFor')}
          </Text>
        </Group>
      </Container>
    </Box>
  )
}

export default LandingFooter
