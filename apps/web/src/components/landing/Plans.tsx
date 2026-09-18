import React from 'react'
import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Divider,
  Grid,
  Group,
  Stack,
  Text,
  Title
} from '@mantine/core'
import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

const TIER_KEYS = ['starter', 'growth', 'enterprise'] as const
const POPULAR_TIER = 'growth'

export const Plans: React.FC = () => {
  const { t } = useTranslation()

  return (
    <Box id="pricing" component="section" py={{ base: 'xl', sm: 80 }}>
      <Container size="lg">
        <Stack gap="xs" ta="center" align="center" mb="xl">
          <Title order={2}>{t('landing.plans.title')}</Title>
          <Text c="dimmed" maw={560}>
            {t('landing.plans.subtitle')}
          </Text>
        </Stack>

        <Grid gutter="sm" align="stretch">
          {TIER_KEYS.map((tierKey) => {
            const isPopular = tierKey === POPULAR_TIER
            const features = t(`landing.plans.tiers.${tierKey}.features`, {
              returnObjects: true
            }) as unknown as string[]

            return (
              <Grid.Col key={tierKey} span={{ base: 12, sm: 4 }}>
                <Card
                  p="lg"
                  h="100%"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    ...(isPopular
                      ? {
                          borderColor: 'var(--mantine-primary-color-filled)',
                          boxShadow: '0 8px 24px var(--mantine-color-default-border)'
                        }
                      : {})
                  }}
                >
                  <Stack gap="xs" style={{ flexGrow: 1 }}>
                    <Group justify="space-between" align="center">
                      <Text fw={700} size="lg">
                        {t(`landing.plans.tiers.${tierKey}.name`)}
                      </Text>
                      {isPopular && (
                        <Badge color="var(--mantine-primary-color-filled)" variant="filled">
                          {t('landing.plans.popular')}
                        </Badge>
                      )}
                    </Group>

                    <Group align="baseline" gap={4}>
                      <Title order={2} fz={32}>
                        {t(`landing.plans.tiers.${tierKey}.price`)}
                      </Title>
                      {tierKey !== 'enterprise' && (
                        <Text size="xs" c="dimmed">
                          {t('landing.plans.perAgent')}
                        </Text>
                      )}
                    </Group>
                    <Text size="sm" c="dimmed" mih={40}>
                      {t(`landing.plans.tiers.${tierKey}.desc`)}
                    </Text>

                    <Divider my="sm" />

                    <Stack gap="xs">
                      {features.map((feature) => (
                        <Group key={feature} gap="xs" wrap="nowrap" align="flex-start">
                          <Check
                            size={16}
                            color="var(--mantine-primary-color-filled)"
                            style={{ flexShrink: 0, marginTop: 2 }}
                          />
                          <Text size="sm">{feature}</Text>
                        </Group>
                      ))}
                    </Stack>
                  </Stack>

                  <Button
                    mt="lg"
                    fullWidth
                    variant={isPopular ? 'filled' : 'default'}
                    component={Link}
                    to="/register"
                  >
                    {t('landing.plans.startTrial')}
                  </Button>
                </Card>
              </Grid.Col>
            )
          })}
        </Grid>
      </Container>
    </Box>
  )
}

export default Plans
