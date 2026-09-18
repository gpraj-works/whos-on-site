import React, { useState } from 'react'
import {
  ActionIcon,
  Anchor,
  Alert,
  Button,
  Card,
  Center,
  Container,
  Group,
  Stack,
  Text,
  TextInput,
  Title
} from '@mantine/core'
import { forgotPasswordSchema } from '@whosonsite/shared'
import { CheckCircle2, Mail } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { Logo } from '../common/Logo'
import { ApiErrorAlert } from '../feedback/ApiErrorAlert'
import { forgotPasswordApi } from './api'

export const ForgotPasswordForm: React.FC = () => {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | undefined>(undefined)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setEmailError(undefined)

    const validation = forgotPasswordSchema.safeParse({ email })
    if (!validation.success) {
      setEmailError(validation.error.errors[0]?.message)
      return
    }

    setLoading(true)
    try {
      await forgotPasswordApi({ email: email.trim().toLowerCase() })
      setSubmitted(true)
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unable to process password reset request.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
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
            Reset Your Password
          </Title>
          <Text size="sm" c="dimmed" mb="md">
            Enter your registered email address and we'll send you instructions to reset your password.
          </Text>

          <ApiErrorAlert error={error} title="Error" />

          {submitted ? (
            <Stack gap="md">
              <Alert
                icon={<CheckCircle2 size={18} />}
                color="teal"
                title="Reset Link Dispatched"
                radius="md"
              >
                If an account with <strong>{email}</strong> exists, instructions to set a new password have been dispatched to your inbox.
              </Alert>

              <Button component={Link} to="/login" fullWidth variant="light">
                Return to Sign In
              </Button>
            </Stack>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <Stack gap="md">
                <TextInput
                  label="Email Address"
                  placeholder="admin@acmehvac.com"
                  leftSection={<Mail size={16} />}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.currentTarget.value)
                    if (emailError) setEmailError(undefined)
                  }}
                  withAsterisk
                  error={emailError}
                />

                <Button type="submit" fullWidth loading={loading} mt="xs">
                  Send Reset Link
                </Button>
              </Stack>
            </form>
          )}

          <Group justify="center" gap={4} mt="lg">
            <Text size="sm" c="dimmed">
              Remember your password?
            </Text>
            <Anchor component={Link} to="/login" size="sm" fw={600}>
              Sign In
            </Anchor>
          </Group>
        </Card>
      </Container>
    </Center>
  )
}

export default ForgotPasswordForm
