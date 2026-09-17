import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { UserRole } from '@whosonsite/shared'
import { describe, expect, it, vi } from 'vitest'

const { mockAuth } = vi.hoisted(() => ({
  mockAuth: {
    isAuthenticated: false,
    isLoading: false,
    user: null as null | { role: string }
  }
}))

vi.mock('../../components/auth/AuthContext', () => ({
  useAuth: () => mockAuth
}))

vi.mock('../../components/layout/AppLayout', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-layout">{children}</div>
  )
}))

vi.mock('../../components/common/LoadingState', () => ({
  LoadingState: ({ message }: { message?: string }) => <div role="status">{message}</div>
}))

import { ProtectedRoute } from '../../components/auth/ProtectedRoute'
import { AgentOnly } from '../../components/auth/AgentOnly'

const resetAuth = (overrides: Partial<typeof mockAuth> = {}) => {
  Object.assign(mockAuth, {
    isAuthenticated: false,
    isLoading: false,
    user: null,
    ...overrides
  })
}

describe('ProtectedRoute', () => {
  it('shows a loading state while the session is being verified', () => {
    resetAuth({ isLoading: true })

    render(
      <MemoryRouter>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<div>child</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('redirects to /login when not authenticated', () => {
    resetAuth({ isAuthenticated: false })

    render(
      <MemoryRouter initialEntries={['/jobs']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/jobs" element={<div>jobs-child</div>} />
          </Route>
          <Route path="/login" element={<div>login-page</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('login-page')).toBeInTheDocument()
    expect(screen.queryByText('jobs-child')).not.toBeInTheDocument()
  })

  it('renders the app layout and outlet content when authenticated', () => {
    resetAuth({ isAuthenticated: true, user: { role: UserRole.DISPATCHER } })

    render(
      <MemoryRouter initialEntries={['/jobs']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/jobs" element={<div>jobs-child</div>} />
          </Route>
          <Route path="/login" element={<div>login-page</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByTestId('app-layout')).toBeInTheDocument()
    expect(screen.getByText('jobs-child')).toBeInTheDocument()
  })

  it('redirects to /dashboard when the user role is not allowed', () => {
    resetAuth({ isAuthenticated: true, user: { role: UserRole.OWNER } })

    render(
      <MemoryRouter initialEntries={['/dispatcher-only']}>
        <Routes>
          <Route element={<ProtectedRoute allowedRoles={[UserRole.DISPATCHER]} />}>
            <Route path="/dispatcher-only" element={<div>dispatcher-content</div>} />
          </Route>
          <Route path="/dashboard" element={<div>dashboard-page</div>} />
          <Route path="/login" element={<div>login-page</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('dashboard-page')).toBeInTheDocument()
  })
})

describe('AgentOnly', () => {
  it('shows a loading state while permissions are verified', () => {
    resetAuth({ isLoading: true })

    render(
      <MemoryRouter>
        <AgentOnly>
          <div>child</div>
        </AgentOnly>
      </MemoryRouter>
    )

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('redirects to /login when not authenticated', () => {
    resetAuth({ isAuthenticated: false })

    render(
      <MemoryRouter initialEntries={['/tech']}>
        <Routes>
          <Route
            path="/tech"
            element={
              <AgentOnly>
                <div>tech-content</div>
              </AgentOnly>
            }
          />
          <Route path="/login" element={<div>login-page</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('login-page')).toBeInTheDocument()
  })

  it('renders children for an agent role', () => {
    resetAuth({ isAuthenticated: true, user: { role: UserRole.AGENT } })

    render(
      <MemoryRouter>
        <AgentOnly>
          <div>tech-content</div>
        </AgentOnly>
      </MemoryRouter>
    )

    expect(screen.getByText('tech-content')).toBeInTheDocument()
  })

  it('renders children for a dispatcher role', () => {
    resetAuth({ isAuthenticated: true, user: { role: UserRole.DISPATCHER } })

    render(
      <MemoryRouter>
        <AgentOnly>
          <div>tech-content</div>
        </AgentOnly>
      </MemoryRouter>
    )

    expect(screen.getByText('tech-content')).toBeInTheDocument()
  })
})
