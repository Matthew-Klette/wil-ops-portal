export type Role = 'admin' | 'staff' | 'client'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  title: string
  clientOrgId?: string
  active: boolean
  lastActive: string
  initialColor: string
}

export interface ClientOrg {
  id: string
  name: string
  industry: string
  primaryContactId: string
  since: string
}

export type RequestStatus =
  | 'submitted'
  | 'in_review'
  | 'in_progress'
  | 'awaiting_client'
  | 'resolved'
  | 'closed'

export type RequestPriority = 'low' | 'standard' | 'high' | 'urgent'

export interface StatusEvent {
  id: string
  status: RequestStatus
  timestamp: string
  actor: string
  note?: string
}

export interface Message {
  id: string
  author: string
  authorRole: Role
  body: string
  timestamp: string
}

export interface WorkRequest {
  id: string
  code: string
  title: string
  description: string
  category: string
  clientOrgId: string
  requestedBy: string
  assignedTo: string | null
  priority: RequestPriority
  status: RequestStatus
  createdAt: string
  updatedAt: string
  statusHistory: StatusEvent[]
  messages: Message[]
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
  | 'view_all_requests'
  | 'manage_users'
  | 'edit_roles'
  | 'assign_requests'
  | 'edit_requests'
  | 'view_reports'
  | 'submit_requests'
  | 'message_staff'

export interface RolePermissions {
  role: Role
  label: string
  permissions: Record<PermissionKey, boolean>
}
