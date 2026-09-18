import React from 'react'
import { Box, Card, Container, SimpleGrid, Stack, Text, ThemeIcon, Title } from '@mantine/core'
import {
  LayoutDashboard,
  Link2,
  MapPinned,
  MousePointerClick,
  ReceiptText,
  UserPlus
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface Feature {
  icon: LucideIcon
  key: string
}

const FEATURES: Feature[] = [
  { icon: LayoutDashboard, key: 'liveBoard' },
  { icon: MousePointerClick, key: 'oneTap' },
  { icon: MapPinned, key: 'nearby' },
  { icon: Link2, key: 'customerPage' },
  { icon: ReceiptText, key: 'auditTrail' },
  { icon: UserPlus, key: 'reassign' }
]

export const Features: React.FC = () => {
  const { t } = useTranslation()

  return (
    <Box id="features" component="section" py={{ base: 'xl', sm: 80 }}>
      <Container size="lg">
        <Stack gap="xs" ta="center" align="center" mb="xl">
          <Title order={2} maw={640}>
            {t('landing.features.title')}
          </Title>
          <Text c="dimmed" maw={560}>
            {t('landing.features.subtitle')}
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          {FEATURES.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.key} p="lg" h="100%">
                <ThemeIcon size={44} radius="md" variant="light" mb="sm">
                  <Icon size={22} />
                </ThemeIcon>
                <Text fw={600} size="md" mb="xs">
                  {t(`landing.features.items.${feature.key}.title`)}
                </Text>
                <Text size="sm" c="dimmed" lh={1.6}>
                  {t(`landing.features.items.${feature.key}.desc`)}
                </Text>
              </Card>
            )
          })}
        </SimpleGrid>
      </Container>
    </Box>
  )
}

export default Features
