import type { Role } from './data/types'
import { IconActivity, IconChart, IconGrid, IconList, IconShield, IconUsers } from './components/icons'

export interface NavItem {
  label: string
  path: string
  icon: typeof IconGrid
  end?: boolean
}

export const navByRole: Record<Role, NavItem[]> = {
  admin: [
    { label: 'Dashboard', path: '/admin', icon: IconGrid, end: true },
    { label: 'User Management', path: '/admin/users', icon: IconUsers },
    { label: 'Roles & Permissions', path: '/admin/roles', icon: IconShield },
    { label: 'Activity Log', path: '/admin/activity', icon: IconActivity },
  ],
  staff: [
    { label: 'Dashboard', path: '/staff', icon: IconGrid, end: true },
    { label: 'Requests', path: '/staff/requests', icon: IconList },
    { label: 'Reports', path: '/staff/reports', icon: IconChart },
  ],
  client: [
    { label: 'Dashboard', path: '/client', icon: IconGrid, end: true },
    { label: 'My Requests', path: '/client/requests', icon: IconList },
  ],
}

export const roleTitle: Record<Role, string> = {
  admin: 'Admin',
  staff: 'Staff',
  client: 'Client',
}
