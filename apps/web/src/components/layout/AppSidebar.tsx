import React from 'react'
import { NavLink, Stack } from '@mantine/core'
import { UserRole } from '@whosonsite/shared'
import { BarChart3, LayoutDashboard, Briefcase, UserCheck, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'

import { useAuth } from '../auth/AuthContext'

interface AppSidebarProps {
  onNavigate?: () => void
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ onNavigate }) => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const location = useLocation()

  const userRole = user?.role || UserRole.OWNER

  const navItems = [
    {
      icon: LayoutDashboard,
      label: t('nav.dashboard'),
      path: '/dashboard',
      roles: [UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT]
    },
    {
      icon: Briefcase,
      label: t('nav.jobs', 'Jobs'),
      path: '/jobs',
      roles: [UserRole.OWNER, UserRole.ADMIN]
    },
    {
      icon: Briefcase,
      label: t('nav.myJobs', 'My Jobs'),
      path: '/my-jobs',
      roles: [UserRole.AGENT]
    },
    {
      icon: Users,
      label: t('nav.agents'),
      path: '/agents',
      roles: [UserRole.OWNER, UserRole.ADMIN]
    },
    {
      icon: UserCheck,
      label: t('nav.customers', 'Customers'),
      path: '/customers',
      roles: [UserRole.OWNER, UserRole.ADMIN]
    },
    {
      icon: BarChart3,
      label: t('nav.analytics'),
      path: '/analytics',
      roles: [UserRole.OWNER, UserRole.ADMIN]
    }
  ]

  const visibleItems = navItems.filter((item) => item.roles.includes(userRole))

  return (
    <Stack gap="xs" p="xs">
      {visibleItems.map((item) => {
        const isActive =
          location.pathname === item.path ||
          (item.path === '/dashboard' && location.pathname === '/')
        return (
          <NavLink
            key={item.path}
            component={Link}
            to={item.path}
            label={item.label}
            leftSection={<item.icon size={18} />}
            active={isActive}
            onClick={onNavigate}
            variant="light"
            style={{ borderRadius: 'var(--mantine-radius-md)' }}
          />
        )
      })}
    </Stack>
  )
}
