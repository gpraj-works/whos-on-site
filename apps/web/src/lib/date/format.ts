import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

/** Format as readable date (e.g. "Sep 1, 2026") */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'N/A'
  return dayjs(date).format('MMM D, YYYY')
}

/** Format as date and time (e.g. "Sep 1, 2026 09:30 AM") */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return 'N/A'
  return dayjs(date).format('MMM D, YYYY hh:mm A')
}

/** Format time only (e.g. "09:30 AM") */
export function formatTime(date: string | Date | null | undefined): string {
  if (!date) return 'N/A'
  return dayjs(date).format('hh:mm A')
}

/** Format relative time from now (e.g. "2 hours ago" or "in 30 minutes") */
export function formatRelative(date: string | Date | null | undefined): string {
  if (!date) return 'N/A'
  return dayjs(date).fromNow()
}
