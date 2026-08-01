import type { RequestPriority, RequestStatus } from '../data/types'

export const STATUS_ORDER: RequestStatus[] = [
  'submitted',
  'in_review',
  'in_progress',
  'awaiting_client',
  'resolved',
]

export function statusTone(status: RequestStatus): 'neutral' | 'signal' | 'pine' {
  switch (status) {
    case 'submitted':
    case 'in_review':
      return 'neutral'
    case 'in_progress':
    case 'awaiting_client':
      return 'signal'
    case 'resolved':
    case 'closed':
      return 'pine'
    default:
      return 'neutral'
  }
}

export function priorityTone(priority: RequestPriority): 'neutral' | 'signal' {
  return priority === 'high' || priority === 'urgent' ? 'signal' : 'neutral'
}

/** Who the request is currently sitting with, regardless of who's viewing it. */
export function waitingOnLabel(status: RequestStatus): string | null {
  switch (status) {
    case 'submitted':
    case 'in_review':
    case 'in_progress':
      return 'Awaiting Staff'
    case 'awaiting_client':
      return 'Awaiting Client'
    case 'resolved':
      return 'Awaiting Client Confirmation'
    case 'closed':
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
