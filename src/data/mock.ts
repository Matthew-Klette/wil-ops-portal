import type { ApplicationStatus, EmploymentType } from './types'

// ---------------------------------------------------------------------------
// Static label dictionaries only — users, companies, job listings,
// applications, chat, role permissions, and the activity log all live in
// Supabase (see DataContext / ListingsContext / ChatContext) so state is
// shared across devices and accounts instead of living in a local mock array.
// ---------------------------------------------------------------------------

export const permissionLabels: Record<string, string> = {
  view_all_listings: 'View all listings across companies',
  manage_users: 'Create and deactivate users',
  edit_roles: 'Edit role permissions',
  review_applications: 'Review and progress applications',
  edit_listings: 'Edit and close job listings',
  view_reports: 'View reports and analytics',
  submit_applications: 'Apply to job listings',
  message_applicants: 'Message applicants on an application',
}

export const applicationStatusLabels: Record<ApplicationStatus, string> = {
  submitted: 'Submitted',
  in_review: 'In Review',
  interview: 'Interview',
  offered: 'Offered',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
}

export const employmentTypeLabels: Record<EmploymentType, string> = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  contract: 'Contract',
  internship: 'Internship',
}
