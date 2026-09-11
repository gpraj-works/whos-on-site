import React from 'react'
import { Badge, MantineColor } from '@mantine/core'
import { JobStatus, TechnicianStatus } from '@whosonsite/shared'
import { useTranslation } from 'react-i18next'

type StatusType = JobStatus | TechnicianStatus | string

interface StatusBadgeProps {
  status: StatusType
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const { t } = useTranslation()

  let color: MantineColor = 'gray'

  switch (status) {
    case JobStatus.UNASSIGNED:
      color = 'yellow'
      break
    case JobStatus.ASSIGNED:
      color = 'blue'
      break
    case JobStatus.EN_ROUTE:
      color = 'indigo'
      break
    case JobStatus.ON_SITE:
      color = 'cyan'
      break
    case JobStatus.COMPLETE:
    case TechnicianStatus.AVAILABLE:
      color = 'green'
      break
    case JobStatus.CANCELLED:
    case TechnicianStatus.OFFLINE:
      color = 'gray'
      break
    case TechnicianStatus.BUSY:
      color = 'orange'
      break
    default:
      color = 'gray'
  }

  const translatedLabel = t(`status.${status}`, status)

  return (
    <Badge color={color} size={size} variant="light" tt="capitalize">
      {translatedLabel}
    </Badge>
  )
}
