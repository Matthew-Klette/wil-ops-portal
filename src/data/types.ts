export type Role = 'admin' | 'recruiter' | 'job_seeker'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  title: string
  companyId?: string
  active: boolean
  lastActive: string
  initialColor: string
  headline?: string
  bio?: string
  resumeUrl?: string
}

export interface Company {
  id: string
  name: string
  industry: string
  primaryContactId: string
  since: string
}

export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'internship'

export type ListingStatus = 'open' | 'closed'

export interface JobListing {
  id: string
  code: string
  title: string
  description: string
  category: string
  employmentType: EmploymentType
  location: string
  companyId: string
  postedBy: string
  imageUrl: string | null
  status: ListingStatus
  createdAt: string
  updatedAt: string
}

export type ApplicationStatus = 'submitted' | 'in_review' | 'interview' | 'offered' | 'rejected' | 'withdrawn'

export interface ApplicationStatusEvent {
  id: string
  status: ApplicationStatus
  timestamp: string
  actor: string
  note?: string
}

export interface Application {
  id: string
  listingId: string
  applicantId: string
  status: ApplicationStatus
  coverNote?: string
  resumeUrl: string | null
  createdAt: string
  updatedAt: string
  statusHistory: ApplicationStatusEvent[]
}

export interface ChatMessage {
  id: string
  threadId: string
  senderId: string
  senderRole: Role
  body: string
  timestamp: string
}

export interface ActivityLogEntry {
  id: string
  actor: string
  actorRole: Role
  action: string
  target: string
  timestamp: string
}

export type PermissionKey =
  | 'view_all_listings'
  | 'manage_users'
  | 'edit_roles'
  | 'review_applications'
  | 'edit_listings'
  | 'view_reports'
  | 'submit_applications'
  | 'message_applicants'

export interface RolePermissions {
  role: Role
  label: string
  permissions: Record<PermissionKey, boolean>
}
