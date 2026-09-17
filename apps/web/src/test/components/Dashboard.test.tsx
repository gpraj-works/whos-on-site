import { MantineProvider } from '@mantine/core'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { UserRole } from '@whosonsite/shared'
import { describe, expect, it, vi } from 'vitest'

const { mockAuth, mockJobs, mockTodayJobs, mockAgents } = vi.hoisted(() => ({
  mockAuth: { user: null as { role: string } | null },
  mockJobs: [] as unknown[],
  mockTodayJobs: [] as unknown[],
  mockAgents: [] as unknown[]
}))

vi.mock('../../components/auth/AuthContext', () => ({
  useAuth: () => mockAuth
}))

vi.mock('../../app/theme/ThemeContext', () => ({
  useAppTheme: () => ({ primaryColor: 'teal' })
}))

vi.mock('../../components/jobs/queries', () => ({
  useJobs: (filters?: { date?: string }) => ({
    data: filters?.date ? mockTodayJobs : mockJobs,
    isLoading: false,
    error: null
  })
}))

vi.mock('../../components/agents/queries', () => ({
  useAgents: () => ({
    data: mockAgents,
    isLoading: false,
    error: null
  })
}))

import { Dashboard } from '../../pages/Dashboard'

const renderDashboard = (role: UserRole) => {
  mockAuth.user = { role }
  return render(
    <MemoryRouter>
      <MantineProvider>
        <Dashboard />
      </MantineProvider>
    </MemoryRouter>
  )
}

describe('Dashboard role-based layout', () => {
  it('renders the company dashboard for a dispatcher', () => {
    renderDashboard(UserRole.DISPATCHER)

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByText('Active Jobs')).toBeInTheDocument()
    expect(screen.getByText('Agents Online')).toBeInTheDocument()
    expect(screen.getByText('Unassigned Jobs')).toBeInTheDocument()
    expect(screen.getByText('En Route')).toBeInTheDocument()
    expect(screen.getByText('Field Agents')).toBeInTheDocument()

    expect(screen.queryByText('My Jobs Today')).not.toBeInTheDocument()
    expect(screen.queryByText('Next Appointment')).not.toBeInTheDocument()
  })

  it('renders the company dashboard for an owner and admin', () => {
    const { unmount } = renderDashboard(UserRole.OWNER)
    expect(screen.getByText('Active Jobs')).toBeInTheDocument()
    unmount()

    renderDashboard(UserRole.ADMIN)
    expect(screen.getByText('Active Jobs')).toBeInTheDocument()
    expect(screen.queryByText('My Jobs Today')).not.toBeInTheDocument()
  })

  it('renders the personalized dashboard for an agent', () => {
    renderDashboard(UserRole.AGENT)

    expect(screen.getByRole('heading', { name: 'My Dashboard' })).toBeInTheDocument()
    expect(screen.getByText('My Jobs Today')).toBeInTheDocument()
    expect(screen.getByText('Next Appointment')).toBeInTheDocument()
    expect(screen.getByText('Completion Rate')).toBeInTheDocument()
    expect(screen.getByText("Today's Schedule")).toBeInTheDocument()

    expect(screen.queryByText('Active Jobs')).not.toBeInTheDocument()
    expect(screen.queryByText('Agents Online')).not.toBeInTheDocument()
    expect(screen.queryByText('Field Agents')).not.toBeInTheDocument()
  })
})
