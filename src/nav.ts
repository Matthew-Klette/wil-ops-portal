import type { Role } from './data/types'
import { IconActivity, IconBuilding, IconChart, IconFile, IconGrid, IconList, IconMessage, IconShield, IconUser, IconUsers } from './components/icons'

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
    { label: 'Listings', path: '/admin/listings', icon: IconList },
    { label: 'Reports', path: '/admin/reports', icon: IconChart },
    { label: 'Companies', path: '/admin/companies', icon: IconBuilding },
    { label: 'Roles & Permissions', path: '/admin/roles', icon: IconShield },
    { label: 'Activity Log', path: '/admin/activity', icon: IconActivity },
    { label: 'Conversations', path: '/admin/conversations', icon: IconMessage },
  ],
  recruiter: [
    { label: 'Dashboard', path: '/recruiter', icon: IconGrid, end: true },
    { label: 'Listings', path: '/recruiter/listings', icon: IconList },
    { label: 'Reports', path: '/recruiter/reports', icon: IconChart },
    { label: 'Profile', path: '/recruiter/profile', icon: IconUser },
  ],
  job_seeker: [
    { label: 'Dashboard', path: '/job_seeker', icon: IconGrid, end: true },
    { label: 'Browse Jobs', path: '/job_seeker/listings', icon: IconList },
    { label: 'My Applications', path: '/job_seeker/applications', icon: IconFile },
    { label: 'Profile', path: '/job_seeker/profile', icon: IconUser },
  ],
}

export const roleTitle: Record<Role, string> = {
  admin: 'Admin',
  recruiter: 'Recruiter',
  job_seeker: 'Job Seeker',
}
