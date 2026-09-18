import React from 'react'
import { Box, Button, Container, Group, Stack, Text, Title } from '@mantine/core'
import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export const CtaBanner: React.FC = () => {
  const { t } = useTranslation()

  return (
    <Box component="section" pb={{ base: 'xl', sm: 80 }}>
      <Container size="lg">
        <Box
          p={{ base: 'xl', sm: 48 }}
          style={{
            border: '1px solid var(--mantine-color-default-border)',
            borderRadius: 'var(--mantine-radius-lg)',
            background:
              'radial-gradient(800px 300px at 50% 0%, var(--mantine-primary-color-light), var(--mantine-color-body) 70%)',
            textAlign: 'center'
          }}
        >
          <Stack align="center" gap="sm">
            <Title order={2} maw={640} ta="center">
              {t('landing.cta.title')}
            </Title>
            <Text c="dimmed" maw={520} ta="center">
              {t('landing.cta.subtitle')}
            </Text>
            <Group gap="sm" mt="sm">
              <Button
                size="lg"
                component={Link}
                to="/register"
                rightSection={<ArrowRight size={18} />}
              >
                {t('landing.cta.primaryCta')}
              </Button>
              <Button size="lg" variant="default" component={Link} to="/login">
                {t('landing.cta.secondaryCta')}
              </Button>
            </Group>
          </Stack>
        </Box>
      </Container>
    </Box>
  )
}

export default CtaBanner
