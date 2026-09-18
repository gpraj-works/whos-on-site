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
  PasswordInput,
  Stack,
  Text,
  Title
} from '@mantine/core'
import { resetPasswordSchema } from '@whosonsite/shared'
import { CheckCircle2, KeyRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'

import { Logo } from '../common/Logo'
import { ApiErrorAlert } from '../feedback/ApiErrorAlert'
import { resetPasswordApi } from './api'

export const ResetPasswordForm: React.FC = () => {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | undefined>(undefined)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setPasswordError(undefined)

    const validation = resetPasswordSchema.safeParse({ token, password })
    if (!validation.success) {
      const tokenErr = validation.error.errors.find((err) => err.path[0] === 'token')
      const passErr = validation.error.errors.find((err) => err.path[0] === 'password')
      if (tokenErr) {
        setError(tokenErr.message)
      }
      if (passErr) {
        setPasswordError(passErr.message)
      }
      return
    }

    setLoading(true)
    try {
      await resetPasswordApi({ token, password })
      setSuccess(true)
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unable to reset password.'
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
            Set New Password
          </Title>
          <Text size="sm" c="dimmed" mb="md">
            Please enter your new password below.
          </Text>

          <ApiErrorAlert error={error} title="Error" />

          {!token && (
            <Alert color="red" title="Missing Reset Token" radius="md" mb="md">
              No reset token was found in the link. Please request a new password reset link.
            </Alert>
          )}

          {success ? (
            <Stack gap="md">
              <Alert
                icon={<CheckCircle2 size={18} />}
                color="teal"
                title="Password Reset Complete"
                radius="md"
              >
                Your password has been reset successfully. You can now sign in with your new password.
              </Alert>

              <Button component={Link} to="/login" fullWidth>
                Sign In Now
              </Button>
            </Stack>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <Stack gap="md">
                <PasswordInput
                  label="New Password"
                  placeholder="At least 8 characters"
                  leftSection={<KeyRound size={16} />}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.currentTarget.value)
                    if (passwordError) setPasswordError(undefined)
                  }}
                  disabled={!token}
                  withAsterisk
                  error={passwordError}
                />

                <Button
                  type="submit"
                  fullWidth
                  loading={loading}
                  disabled={!token}
                  mt="xs"
                >
                  Update Password
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

export default ResetPasswordForm
