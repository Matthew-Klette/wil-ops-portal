import type { RequestPriority, RequestStatus } from './types'

// ---------------------------------------------------------------------------
// Static label dictionaries only — users, client orgs, work requests, role
// permissions, and the activity log now live in Supabase (see DataContext /
// RequestsContext) so state is shared across devices and accounts instead of
// living in a local mock array.
// ---------------------------------------------------------------------------

export const permissionLabels: Record<string, string> = {
  view_all_requests: 'View all requests across clients',
  manage_users: 'Create and deactivate users',
  edit_roles: 'Edit role permissions',
  assign_requests: 'Assign requests to staff',
  edit_requests: 'Edit request details and status',
  view_reports: 'View reports and analytics',
  submit_requests: 'Submit new requests',
  message_staff: 'Message staff on a request',
}

export const statusLabels: Record<RequestStatus, string> = {
  submitted: 'Submitted',
  in_review: 'In Review',
  in_progress: 'In Progress',
  awaiting_client: 'Awaiting You',
  resolved: 'Resolved',
  closed: 'Closed',
}

export const priorityLabels: Record<RequestPriority, string> = {
  low: 'Low',
  standard: 'Standard',
  high: 'High',
  urgent: 'Urgent',
}
