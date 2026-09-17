import { MantineProvider } from '@mantine/core'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

const { mockLogin } = vi.hoisted(() => ({
  mockLogin: vi.fn().mockResolvedValue(undefined)
}))

const { mockNavigate } = vi.hoisted(() => ({
  mockNavigate: vi.fn()
}))

const { mockLocation } = vi.hoisted(() => ({
  mockLocation: { state: null, pathname: '/login' as string | null }
}))

vi.mock('../../components/auth/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin })
}))

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation
  }
})

import { LoginForm } from '../../components/auth/Form'

const renderForm = () =>
  render(
    <MantineProvider>
      <LoginForm />
    </MantineProvider>
  )

describe('LoginForm', () => {
  it('shows a Zod validation error when submitted empty', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.click(screen.getByRole('button', { name: 'Sign In' }))

    expect(await screen.findByText('Invalid email address')).toBeInTheDocument()
  })

  it('shows validation error for an invalid email format', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.type(screen.getByPlaceholderText('dispatcher@acmehvac.com'), 'not-an-email')
    await user.type(screen.getByPlaceholderText('Your password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Sign In' }))

    expect(await screen.findByText('Invalid email address')).toBeInTheDocument()
  })

  it('calls login and navigates on valid submission', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.type(screen.getByPlaceholderText('dispatcher@acmehvac.com'), 'user@test.com')
    await user.type(screen.getByPlaceholderText('Your password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Sign In' }))

    await vi.waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'user@test.com',
        password: 'password123'
      })
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true })
    })
  })

  it('populates fields when a quick demo account button is clicked', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.click(screen.getByRole('button', { name: 'Dispatcher' }))

    expect(screen.getByPlaceholderText('dispatcher@acmehvac.com')).toHaveValue(
      'dispatcher@acmehvac.com'
    )
    expect(screen.getByPlaceholderText('Your password')).toHaveValue('password123')
  })
})
