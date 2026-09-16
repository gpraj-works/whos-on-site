import { MantineProvider } from '@mantine/core'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ApiErrorAlert } from '../../components/feedback/ApiErrorAlert'

const renderAlert = (error: Error | string | null | undefined) =>
  render(
    <MantineProvider>
      <ApiErrorAlert error={error} />
    </MantineProvider>
  )

describe('ApiErrorAlert', () => {
  it('renders nothing when there is no error', () => {
    renderAlert(null)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('renders a string error message', () => {
    renderAlert('Login failed')
    expect(screen.getByText('Login failed')).toBeInTheDocument()
  })

  it('renders the message of an Error object', () => {
    renderAlert(new Error('Something broke'))
    expect(screen.getByText('Something broke')).toBeInTheDocument()
  })
})