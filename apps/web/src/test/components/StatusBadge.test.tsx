import { MantineProvider } from '@mantine/core'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StatusBadge } from '../../components/common/StatusBadge'

const renderBadge = (status: string) =>
  render(
    <MantineProvider>
      <StatusBadge status={status} />
    </MantineProvider>
  )

describe('StatusBadge', () => {
  it('renders the translated label for a job status', () => {
    renderBadge('assigned')
    expect(screen.getByText('Assigned')).toBeInTheDocument()
  })

  it('renders the translated label for an agent status', () => {
    renderBadge('available')
    expect(screen.getByText('Available')).toBeInTheDocument()
  })

  it('falls back to the raw value when no translation exists', () => {
    renderBadge('mystery-status')
    expect(screen.getByText('mystery-status')).toBeInTheDocument()
  })
})