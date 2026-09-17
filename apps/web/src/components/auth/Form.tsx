import React, { useState } from 'react'
import {
  ActionIcon,
  Button,
  Card,
  Center,
  Container,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title
} from '@mantine/core'
import { loginSchema } from '@whosonsite/shared'
import { KeyRound, Mail } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'

import { Logo } from '../common/Logo'
import { ApiErrorAlert } from '../feedback/ApiErrorAlert'
import { useAuth } from './AuthContext'

export const LoginForm: React.FC = () => {
  const { t } = useTranslation()
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    const validation = loginSchema.safeParse({ email, password })
    if (!validation.success) {
      const formattedErrors: { email?: string; password?: string } = {}
      validation.error.errors.forEach((err: { path: (string | number)[]; message: string }) => {
        const fieldName = err.path[0] as 'email' | 'password'
        if (fieldName && !formattedErrors[fieldName]) {
          formattedErrors[fieldName] = err.message
        }
      })
      setFieldErrors(formattedErrors)
      return
    }

    setLoading(true)
    try {
      await login({ email, password })
      navigate(from, { replace: true })
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Login failed. Please check your credentials.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const fillDemoCredentials = (demoEmail: string) => {
    setEmail(demoEmail)
    setPassword('password123')
    setFieldErrors({})
  }

  return (
    <Center mih="100vh" bg="var(--mantine-color-body)" p="md">
      <Container size={420} w="100%">
        <Stack align="center" mb="lg">
          <ActionIcon size={54} radius="xl" variant="filled">
            <Logo size={32} color="currentColor" />
          </ActionIcon>
          <Title order={2} ta="center">
            {t('app.name')}
          </Title>
          <Text size="sm" c="dimmed" ta="center">
            {t('app.tagline')}
          </Text>
        </Stack>

        <Card radius="md" p={{ base: 'lg', sm: 'xl' }} withBorder shadow="sm">
          <Title order={4} mb="md">
            Sign In to your Company
          </Title>

          <ApiErrorAlert error={error} title="Authentication Error" />

          <form onSubmit={handleSubmit} noValidate>
            <Stack gap="md">
              <TextInput
                label="Email Address"
                placeholder="dispatcher@acmehvac.com"
                leftSection={<Mail size={16} />}
                value={email}
                onChange={(e) => {
                  setEmail(e.currentTarget.value)
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }))
                }}
                withAsterisk
                error={fieldErrors.email}
              />

              <PasswordInput
                label="Password"
                placeholder="Your password"
                leftSection={<KeyRound size={16} />}
                value={password}
                onChange={(e) => {
                  setPassword(e.currentTarget.value)
                  if (fieldErrors.password)
                    setFieldErrors((prev) => ({ ...prev, password: undefined }))
                }}
                withAsterisk
                error={fieldErrors.password}
              />

              <Button type="submit" fullWidth loading={loading} mt="xs">
                Sign In
              </Button>
            </Stack>
          </form>

          {/* Quick Demo Account Selector */}
          <Stack
            gap={6}
            mt="lg"
            pt="md"
            style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}
          >
            <Text size="xs" c="dimmed" fw={600} tt="uppercase">
              Quick Demo Logins (Password: password123)
            </Text>
            <Group gap="xs">
              <Button
                size="xs"
                variant="light"
                color="teal"
                onClick={() => fillDemoCredentials('owner@acmehvac.com')}
              >
                Owner
              </Button>
              <Button
                size="xs"
                variant="light"
                color="indigo"
                onClick={() => fillDemoCredentials('admin@acmehvac.com')}
              >
                Admin
              </Button>
              <Button
                size="xs"
                variant="light"
                color="blue"
                onClick={() => fillDemoCredentials('dispatcher@acmehvac.com')}
              >
                Dispatcher
              </Button>
              <Button
                size="xs"
                variant="light"
                color="orange"
                onClick={() => fillDemoCredentials('tech1@acmehvac.com')}
              >
                Agent
              </Button>
            </Group>
          </Stack>
        </Card>
      </Container>
    </Center>
  )
}
