import React from 'react'
import { MantineProvider } from '@mantine/core'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PageHeader } from '../../components/common/PageHeader'

const renderHeader = (props: React.ComponentProps<typeof PageHeader>) =>
  render(
    <MantineProvider>
      <PageHeader {...props} />
    </MantineProvider>
  )

describe('PageHeader', () => {
  it('renders the title', () => {
    renderHeader({ title: 'Jobs' })
    expect(screen.getByRole('heading', { name: 'Jobs' })).toBeInTheDocument()
  })

  it('renders the description as subtitle text', () => {
    renderHeader({ title: 'Jobs', description: 'Live job tracking' })
    expect(screen.getByText('Live job tracking')).toBeInTheDocument()
  })

  it('renders the action node when provided', () => {
    renderHeader({ title: 'Jobs', action: <button type="button">Add New</button> })
    expect(screen.getByRole('button', { name: 'Add New' })).toBeInTheDocument()
  })
})