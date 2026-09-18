import React from 'react'
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title
} from '@mantine/core'
import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

interface JobRow {
  titleKey: string
  agent: string
  status: 'en_route' | 'on_site'
  etaKey?: string
}

interface AgentRow {
  name: string
  initials: string
  status: 'available' | 'busy' | 'offline'
  color: string
}

const JOB_ROWS: JobRow[] = [
  {
    titleKey: 'landing.hero.jobCardTitle',
    agent: 'Ravi Kumar',
    status: 'en_route',
    etaKey: 'landing.hero.jobCardEta'
  },
  { titleKey: 'landing.hero.jobCardTitle2', agent: 'Meera Nair', status: 'on_site' }
]

const AGENT_ROWS: AgentRow[] = [
  { name: 'Ravi Kumar', initials: 'RK', status: 'available', color: 'teal' },
  { name: 'Meera Nair', initials: 'MN', status: 'busy', color: 'blue' },
  { name: 'David Chen', initials: 'DC', status: 'offline', color: 'gray' }
]

const JOB_STATUS_COLOR: Record<JobRow['status'], string> = {
  en_route: 'cyan',
  on_site: 'teal'
}

export const Hero: React.FC = () => {
  const { t } = useTranslation()

  return (
    <Box
      style={{
        background:
          'radial-gradient(1100px 420px at 50% -8%, var(--mantine-primary-color-light), var(--mantine-color-body) 70%)'
      }}
    >
      <Container size="lg" py={{ base: 'xl', sm: 80 }}>
        <Stack align="center" gap="md" ta="center">
          <Badge size="lg" variant="light" radius="xl" px="md">
            {t('landing.hero.badge')}
          </Badge>

          <Title order={1} fz={{ base: 34, sm: 48 }} lh={1.1} maw={760} ta="center">
            {t('landing.hero.title')}
          </Title>

          <Text fz={{ base: 16, sm: 19 }} c="dimmed" ta="center" maw={620}>
            {t('landing.hero.subtitle')}
          </Text>

          <Group gap="sm" mt="sm">
            <Button
              size="lg"
              component={Link}
              to="/register"
              rightSection={<ArrowRight size={18} />}
            >
              {t('landing.hero.primaryCta')}
            </Button>
            <Button size="lg" variant="default" component={Link} to="/login">
              {t('landing.hero.secondaryCta')}
            </Button>
          </Group>
        </Stack>

        <Card
          withBorder
          radius="lg"
          mt={48}
          p={{ base: 'md', sm: 'lg' }}
          maw={860}
          mx="auto"
          style={{ borderTop: '4px solid var(--mantine-primary-color-filled)' }}
        >
          <Group gap="xs" wrap="nowrap" mb="md">
            <Box
              w={10}
              h={10}
              style={{
                borderRadius: '50%',
                backgroundColor: 'var(--mantine-primary-color-filled)'
              }}
            />
            <Text fw={700} size="sm">
              {t('landing.hero.liveBoard')}
            </Text>
          </Group>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <Stack gap="sm">
              {JOB_ROWS.map((job) => (
                <Group
                  key={job.titleKey}
                  justify="space-between"
                  p="sm"
                  gap="sm"
                  wrap="nowrap"
                  style={{
                    border: '1px solid var(--mantine-color-default-border)',
                    borderRadius: 8
                  }}
                >
                  <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
                    <Badge size="md" color={JOB_STATUS_COLOR[job.status]} variant="light">
                      {t(`status.${job.status}`)}
                    </Badge>
                    <Box style={{ minWidth: 0 }}>
                      <Text size="sm" fw={600} lineClamp={1}>
                        {t(job.titleKey)}
                      </Text>
                      <Text size="xs" c="dimmed" lineClamp={1}>
                        {job.agent}
                        {job.etaKey ? ` · ${t(job.etaKey)}` : ''}
                      </Text>
                    </Box>
                  </Group>
                </Group>
              ))}
            </Stack>

            <Box>
              <Text size="xs" c="dimmed" fw={600} tt="uppercase" mb="xs">
                {t('landing.hero.agentCardLabel')}
              </Text>
              <Stack gap="xs">
                {AGENT_ROWS.map((agent) => (
                  <Group
                    key={agent.name}
                    justify="space-between"
                    p="xs"
                    gap="sm"
                    wrap="nowrap"
                    style={{
                      border: '1px solid var(--mantine-color-default-border)',
                      borderRadius: 8
                    }}
                  >
                    <Group gap="xs" wrap="nowrap">
                      <Avatar color={agent.color} radius="xl" size="sm">
                        {agent.initials}
                      </Avatar>
                      <Text size="sm" fw={500}>
                        {agent.name}
                      </Text>
                    </Group>
                    <Badge size="sm" color={agent.color} variant="light">
                      {t(`status.${agent.status}`)}
                    </Badge>
                  </Group>
                ))}
              </Stack>
            </Box>
          </SimpleGrid>
        </Card>
      </Container>
    </Box>
  )
}

export default Hero
