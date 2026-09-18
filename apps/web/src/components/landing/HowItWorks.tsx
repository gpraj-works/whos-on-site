import React from 'react'
import { Box, Container, SimpleGrid, Stack, Text, ThemeIcon, Title } from '@mantine/core'
import { ClipboardList, Navigation, Radar } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface Step {
  icon: LucideIcon
  key: string
}

const STEPS: Step[] = [
  { icon: ClipboardList, key: 'create' },
  { icon: Navigation, key: 'assign' },
  { icon: Radar, key: 'track' }
]

export const HowItWorks: React.FC = () => {
  const { t } = useTranslation()

  return (
    <Box
      id="how-it-works"
      component="section"
      py={{ base: 'xl', sm: 80 }}
      style={{ backgroundColor: 'var(--mantine-color-default-hover)' }}
    >
      <Container size="lg">
        <Stack gap="xs" ta="center" align="center" mb="xl">
          <Title order={2} maw={640}>
            {t('landing.how.title')}
          </Title>
          <Text c="dimmed" maw={560}>
            {t('landing.how.subtitle')}
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
          {STEPS.map((step, index) => {
            const Icon = step.icon
            return (
              <Box key={step.key} ta="center" p="md">
                <ThemeIcon size={56} radius="xl" variant="filled" mx="auto" mb="sm">
                  <Icon size={26} />
                </ThemeIcon>
                <Text size="xs" c="dimmed" fw={600} tt="uppercase" mb={4}>
                  {t('landing.how.stepLabel')} {index + 1}
                </Text>
                <Text fw={600} size="md" mb="xs">
                  {t(`landing.how.steps.${step.key}.title`)}
                </Text>
                <Text size="sm" c="dimmed" lh={1.6}>
                  {t(`landing.how.steps.${step.key}.desc`)}
                </Text>
              </Box>
            )
          })}
        </SimpleGrid>
      </Container>
    </Box>
  )
}

export default HowItWorks
