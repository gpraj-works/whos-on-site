import React, { useState } from 'react'
import {
  ActionIcon,
  Anchor,
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
import { registerSchema } from '@whosonsite/shared'
import { Building2, KeyRound, Mail } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'

import { AddressPicker } from '../common/AddressPicker'
import { Logo } from '../common/Logo'
import { ApiErrorAlert } from '../feedback/ApiErrorAlert'
import MobileInput from '../shared/MobileInput'
import { useAuth } from './AuthContext'

interface RegisterFieldErrors {
  companyName?: string
  email?: string
  phone?: string
  password?: string
  address?: string
}

export const RegisterForm: React.FC = () => {
  const { t } = useTranslation()
  const { register } = useAuth()
  const navigate = useNavigate()

  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    const validation = registerSchema.safeParse({
      companyName,
      email,
      phone,
      password,
      address,
      latitude,
      longitude
    })

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
      await register({
        companyName,
        email,
        phone,
        password,
        address,
        latitude,
        longitude
      })
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
    <Center mih="100vh" bg="var(--mantine-color-body)" py="xl" px="md">
      <Container size={520} w="100%">
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

              <MobileInput
                label="Phone Number"
                placeholder="(555) 000-0000"
                value={phone}
                onChange={(val) => {
                  setPhone(val)
                  clearFieldError('phone')
                }}
                withAsterisk
                error={fieldErrors.phone}
              />

              <AddressPicker
                value={address}
                onChange={(newAddress) => {
                  setAddress(newAddress)
                  clearFieldError('address')
                }}
                latitude={latitude}
                longitude={longitude}
                onCoordinatesChange={(lat, lng) => {
                  setLatitude(lat)
                  setLongitude(lng)
                }}
                label="Company Address"
                placeholder="Start typing company address, or pick on map"
                error={fieldErrors.address}
                withAsterisk
                zIndex={400}
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
