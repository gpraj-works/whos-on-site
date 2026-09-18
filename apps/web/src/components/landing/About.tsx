import React from 'react'
import { Badge, Box, Container, Grid, Group, Stack, Text, Title } from '@mantine/core'
import { useTranslation } from 'react-i18next'

export const About: React.FC = () => {
  const { t } = useTranslation()
  const verticals = t('landing.about.verticals', { returnObjects: true }) as unknown as string[]

  return (
    <Box id="about" component="section" py={{ base: 'xl', sm: 80 }}>
      <Container size="lg">
        <Grid gutter="lg" align="center">
          <Grid.Col span={{ base: 12, sm: 7 }}>
            <Stack gap="sm">
              <Title order={2}>{t('landing.about.title')}</Title>
              <Text fw={600} c="var(--mantine-color-text)">
                {t('landing.about.subtitle')}
              </Text>
              <Text c="dimmed" lh={1.7}>
                {t('landing.about.body')}
              </Text>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 5 }}>
            <Box
              p="lg"
              style={{
                border: '1px solid var(--mantine-color-default-border)',
                borderRadius: 'var(--mantine-radius-md)',
                backgroundColor: 'var(--mantine-color-default-hover)'
              }}
            >
              <Stack gap="sm">
                <Text fw={700} size="sm" tt="uppercase" c="dimmed">
                  {t('landing.about.verticalsTitle')}
                </Text>
                <Group gap="xs">
                  {verticals.map((vertical) => (
                    <Badge key={vertical} size="lg" variant="light" radius="sm" px="sm">
                      {vertical}
                    </Badge>
                  ))}
                </Group>
              </Stack>
            </Box>
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  )
}

export default About
