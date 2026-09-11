import React from 'react'
import { AppShell, Container } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { AppHeader } from './AppHeader'
import { AppSidebar } from './AppSidebar'

interface AppLayoutProps {
  children: React.ReactNode
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure()

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 240,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened }
      }}
      padding={{ base: 'xs', sm: 'md' }}
    >
      <AppShell.Header>
        <AppHeader mobileOpened={mobileOpened} toggleMobile={toggleMobile} />
      </AppShell.Header>

      <AppShell.Navbar p="xs">
        <AppSidebar onNavigate={closeMobile} />
      </AppShell.Navbar>

      <AppShell.Main>
        <Container fluid p={{ base: 'xs', sm: 0 }}>
          {children}
        </Container>
      </AppShell.Main>
    </AppShell>
  )
}
