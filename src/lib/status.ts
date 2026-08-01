import type { ApplicationStatus } from '../data/types'

export const APPLICATION_STATUS_ORDER: ApplicationStatus[] = [
  'submitted',
  'in_review',
  'interview',
  'offered',
]

export function applicationStatusTone(status: ApplicationStatus): 'neutral' | 'signal' | 'pine' {
  switch (status) {
    case 'submitted':
    case 'in_review':
      return 'neutral'
    case 'interview':
      return 'signal'
    case 'offered':
      return 'pine'
    case 'rejected':
    case 'withdrawn':
      return 'neutral'
    default:
      return 'neutral'
  }
}

/** Who the application is currently sitting with, regardless of who's viewing it. */
export function applicationWaitingOnLabel(status: ApplicationStatus): string | null {
  switch (status) {
    case 'submitted':
    case 'in_review':
      return 'Awaiting Recruiter'
    case 'interview':
      return 'Interview in Progress'
    case 'offered':
      return 'Awaiting Your Response'
    case 'rejected':
    case 'withdrawn':
      return null
  }
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.round(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.round(hrs / 24)
  if (days < 30) return `${days}d ago`
  return formatDate(iso)
}
