import React, { useState } from 'react'
import {
  ActionIcon,
  Button,
  Card,
  Center,
  Container,
  Group,
  Stack,
  Text,
  TextInput,
  PasswordInput,
  Title,
  Anchor
} from '@mantine/core'
import { registerSchema } from '@whosonsite/shared'
import { Building2, KeyRound, Mail } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'

import { Logo } from '../common/Logo'
import { ApiErrorAlert } from '../feedback/ApiErrorAlert'
import { useAuth } from './AuthContext'

interface RegisterFieldErrors {
  companyName?: string
  email?: string
  password?: string
}

export const RegisterForm: React.FC = () => {
  const { t } = useTranslation()
  const { register } = useAuth()
  const navigate = useNavigate()

  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    const validation = registerSchema.safeParse({ companyName, email, password })
    if (!validation.success) {
      const formattedErrors: RegisterFieldErrors = {}
      validation.error.errors.forEach((err: { path: (string | number)[]; message: string }) => {
        const fieldName = err.path[0] as keyof RegisterFieldErrors
        if (fieldName && !formattedErrors[fieldName]) {
          formattedErrors[fieldName] = err.message
        }
      })
      setFieldErrors(formattedErrors)
      return
    }

    setLoading(true)
    try {
      await register({ companyName, email, password })
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Registration failed. Please check your details and try again.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const clearFieldError = (field: keyof RegisterFieldErrors) => {
    setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
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
          <Title order={4} mb={4}>
            {t('auth.register.title')}
          </Title>
          <Text size="sm" c="dimmed" mb="md">
            {t('auth.register.subtitle')}
          </Text>

          <ApiErrorAlert error={error} title="Registration Error" />

          <form onSubmit={handleSubmit} noValidate>
            <Stack gap="md">
              <TextInput
                label={t('auth.register.companyName')}
                placeholder={t('auth.register.companyNamePlaceholder')}
                leftSection={<Building2 size={16} />}
                value={companyName}
                onChange={(e) => {
                  setCompanyName(e.currentTarget.value)
                  clearFieldError('companyName')
                }}
                withAsterisk
                error={fieldErrors.companyName}
              />

              <TextInput
                label={t('auth.register.email')}
                placeholder={t('auth.register.emailPlaceholder')}
                leftSection={<Mail size={16} />}
                value={email}
                onChange={(e) => {
                  setEmail(e.currentTarget.value)
                  clearFieldError('email')
                }}
                withAsterisk
                error={fieldErrors.email}
              />

              <PasswordInput
                label={t('auth.register.password')}
                placeholder={t('auth.register.password')}
                leftSection={<KeyRound size={16} />}
                value={password}
                onChange={(e) => {
                  setPassword(e.currentTarget.value)
                  clearFieldError('password')
                }}
                withAsterisk
                error={fieldErrors.password}
              />

              <Button type="submit" fullWidth loading={loading} mt="xs">
                {t('auth.register.submit')}
              </Button>
            </Stack>
          </form>

          <Group justify="center" gap={4} mt="lg">
            <Text size="sm" c="dimmed">
              {t('auth.register.hasAccount')}
            </Text>
            <Anchor component={Link} to="/login" size="sm" fw={600}>
              {t('auth.register.signIn')}
            </Anchor>
          </Group>
        </Card>
      </Container>
    </Center>
  )
}

export default RegisterForm
