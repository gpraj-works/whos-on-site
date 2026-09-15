import React from 'react'
import { Badge, MantineColor } from '@mantine/core'
import { JobStatus, TechnicianStatus } from '@whosonsite/shared'
import { useTranslation } from 'react-i18next'

import { getJobStatusColor, getTechnicianStatusColor } from '../../app/theme'

type StatusType = JobStatus | TechnicianStatus | string

interface StatusBadgeProps {
  status: StatusType
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const { t } = useTranslation()

  let color: MantineColor = 'gray'

  if (Object.values(JobStatus).includes(status as JobStatus)) {
    color = getJobStatusColor(status as JobStatus)
  } else if (Object.values(TechnicianStatus).includes(status as TechnicianStatus)) {
    color = getTechnicianStatusColor(status as TechnicianStatus)
  } else {
    color = getJobStatusColor(status)
  }

  const translatedLabel = t(`status.${status}`, status)

  return (
    <Badge color={color} size={size} variant="light" tt="capitalize">
      {translatedLabel}
    </Badge>
  )
}
