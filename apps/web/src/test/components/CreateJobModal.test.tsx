import { MantineProvider } from '@mantine/core'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

const { mockMutateAsync } = vi.hoisted(() => ({
  mockMutateAsync: vi.fn()
}))

vi.mock('../../components/jobs/queries', () => ({
  useCreateJob: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
    error: null
  }),
  useUpdateJob: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    error: null
  })
}))

vi.mock('../../components/customers/queries', () => ({
  useCustomers: () => ({ data: [], isLoading: false })
}))

vi.mock('../../components/customers/Form', () => ({
  CustomerFormModal: () => null
}))

import { JobFormModal } from '../../components/jobs/Form'

describe('JobFormModal', () => {
  it('shows a Zod validation error when submitted without a customer', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(
      <MantineProvider>
        <JobFormModal opened onClose={onClose} />
      </MantineProvider>
    )

    await user.click(screen.getByRole('button', { name: 'Add' }))

    expect(await screen.findByText('Please select a customer')).toBeInTheDocument()
    expect(mockMutateAsync).not.toHaveBeenCalled()
  })
})