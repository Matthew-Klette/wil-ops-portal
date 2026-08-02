import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { ActivityLogEntry, Company, PermissionKey, Role, RolePermissions, User } from '../data/types'

interface NewUserInput {
  name: string
  email: string
  role: Role
  title: string
  initialColor: string
}

interface UserUpdateInput {
  name: string
  email: string
  title: string
  role: Role
  companyId?: string
}

interface NewCompanyInput {
  name: string
  industry: string
  since: string
}

interface CompanyUpdateInput {
  name: string
  industry: string
  since: string
}

interface ProfileUpdateInput {
  headline?: string
  bio?: string
  skills?: string[]
  resumeUrl?: string | null
}

interface DataContextValue {
  loading: boolean
  users: User[]
  companies: Company[]
  rolePermissions: RolePermissions[]
  activityLog: ActivityLogEntry[]
  getUserById: (id: string) => User | undefined
  getCompanyById: (id: string) => Company | undefined
  createUser: (input: NewUserInput) => Promise<User>
  updateUser: (id: string, updates: UserUpdateInput) => Promise<void>
  updateProfile: (id: string, updates: ProfileUpdateInput) => Promise<void>
  toggleUserActive: (id: string) => Promise<void>
  deleteUser: (id: string) => Promise<void>
  createCompany: (input: NewCompanyInput) => Promise<Company>
  updateCompany: (id: string, updates: CompanyUpdateInput) => Promise<void>
  deleteCompany: (id: string) => Promise<void>
  updateRolePermission: (role: Role, key: PermissionKey, value: boolean) => Promise<void>
  logActivity: (entry: Omit<ActivityLogEntry, 'id'>) => Promise<void>
}

const DataContext = createContext<DataContextValue | undefined>(undefined)

function mapUser(row: any): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    title: row.title,
    companyId: row.company_id ?? undefined,
    active: row.active,
    lastActive: row.last_active,
    initialColor: row.initial_color,
    headline: row.headline ?? undefined,
    bio: row.bio ?? undefined,
    resumeUrl: row.resume_url ?? undefined,
    skills: row.skills ?? [],
  }
}

function mapCompany(row: any): Company {
  return {
    id: row.id,
    name: row.name,
    industry: row.industry,
    primaryContactId: row.primary_contact_id,
    since: row.since,
  }
}

function mapRolePermissions(row: any): RolePermissions {
  return { role: row.role, label: row.label, permissions: row.permissions }
}

function mapActivity(row: any): ActivityLogEntry {
  return { id: row.id, actor: row.actor, actorRole: row.actor_role, action: row.action, target: row.target, timestamp: row.timestamp }
}

/** Postgres FK violation — used to turn a raw delete error into a friendly message. */
function isForeignKeyViolation(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { code?: string }).code === '23503'
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [rolePermissions, setRolePermissions] = useState<RolePermissions[]>([])
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([])

  const refetchUsers = useCallback(async () => {
    const { data } = await supabase.from('users').select('*').order('name')
    setUsers((data ?? []).map(mapUser))
  }, [])

  const refetchCompanies = useCallback(async () => {
    const { data } = await supabase.from('companies').select('*').order('name')
    setCompanies((data ?? []).map(mapCompany))
  }, [])

  const refetchRolePermissions = useCallback(async () => {
    const { data } = await supabase.from('role_permissions').select('*')
    setRolePermissions((data ?? []).map(mapRolePermissions))
  }, [])

  const refetchActivityLog = useCallback(async () => {
    const { data } = await supabase.from('activity_log').select('*').order('timestamp', { ascending: false }).limit(200)
    setActivityLog((data ?? []).map(mapActivity))
  }, [])

  useEffect(() => {
    let cancelled = false
    async function loadAll() {
      await Promise.all([refetchUsers(), refetchCompanies(), refetchRolePermissions(), refetchActivityLog()])
      if (cancelled) return
      setLoading(false)
    }
    loadAll()

    const channel = supabase
      .channel('data-context')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => refetchUsers())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'companies' }, () => refetchCompanies())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'role_permissions' }, () => refetchRolePermissions())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_log' }, () => refetchActivityLog())
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [refetchUsers, refetchCompanies, refetchRolePermissions, refetchActivityLog])

  const value = useMemo<DataContextValue>(
    () => ({
      loading,
      users,
      companies,
      rolePermissions,
      activityLog,
      getUserById: (id) => users.find((u) => u.id === id),
      getCompanyById: (id) => companies.find((c) => c.id === id),
      createUser: async (input) => {
        const id = `u-${crypto.randomUUID()}`
        const now = new Date().toISOString()
        const { error } = await supabase.from('users').insert({
          id,
          name: input.name,
          email: input.email,
          role: input.role,
          title: input.title,
          active: true,
          last_active: now,
          initial_color: input.initialColor,
        })
        if (error) throw error
        await supabase.from('activity_log').insert({
          id: `al-${crypto.randomUUID()}`,
          actor: 'Braeden Naidoo',
          actor_role: 'admin',
          action: 'invited user',
          target: input.name,
          timestamp: now,
        })
        return {
          id,
          name: input.name,
          email: input.email,
          role: input.role,
          title: input.title,
          active: true,
          lastActive: now,
          initialColor: input.initialColor,
          skills: [],
        }
      },
      updateUser: async (id, updates) => {
        const { error } = await supabase
          .from('users')
          .update({
            name: updates.name,
            email: updates.email,
            title: updates.title,
            role: updates.role,
            company_id: updates.companyId ?? null,
          })
          .eq('id', id)
        if (error) throw error
        await supabase.from('activity_log').insert({
          id: `al-${crypto.randomUUID()}`,
          actor: 'Braeden Naidoo',
          actor_role: 'admin',
          action: 'updated user',
          target: updates.name,
          timestamp: new Date().toISOString(),
        })
      },
      updateProfile: async (id, updates) => {
        const { error } = await supabase
          .from('users')
          .update({
            ...(updates.headline !== undefined ? { headline: updates.headline || null } : {}),
            ...(updates.bio !== undefined ? { bio: updates.bio || null } : {}),
            ...(updates.skills !== undefined ? { skills: updates.skills } : {}),
            ...(updates.resumeUrl !== undefined ? { resume_url: updates.resumeUrl } : {}),
          })
          .eq('id', id)
        if (error) throw error
      },
      toggleUserActive: async (id) => {
        const user = users.find((u) => u.id === id)
        if (!user) return
        const nextActive = !user.active
        await supabase.from('users').update({ active: nextActive }).eq('id', id)
        await supabase.from('activity_log').insert({
          id: `al-${crypto.randomUUID()}`,
          actor: 'Braeden Naidoo',
          actor_role: 'admin',
          action: nextActive ? 'reactivated user' : 'deactivated user',
          target: user.name,
          timestamp: new Date().toISOString(),
        })
      },
      deleteUser: async (id) => {
        const user = users.find((u) => u.id === id)
        if (!user) return
        const { error } = await supabase.from('users').delete().eq('id', id)
        if (error) {
          if (isForeignKeyViolation(error)) {
            throw new Error(`Can't delete ${user.name} — they still have listings, applications, or messages on record. Deactivate instead.`)
          }
          throw error
        }
        await supabase.from('activity_log').insert({
          id: `al-${crypto.randomUUID()}`,
          actor: 'Braeden Naidoo',
          actor_role: 'admin',
          action: 'deleted user',
          target: user.name,
          timestamp: new Date().toISOString(),
        })
      },
      createCompany: async (input) => {
        const id = `co-${crypto.randomUUID()}`
        const { error } = await supabase.from('companies').insert({
          id,
          name: input.name,
          industry: input.industry,
          since: input.since,
          primary_contact_id: null,
        })
        if (error) throw error
        return { id, name: input.name, industry: input.industry, since: input.since, primaryContactId: '' }
      },
      updateCompany: async (id, updates) => {
        const { error } = await supabase
          .from('companies')
          .update({ name: updates.name, industry: updates.industry, since: updates.since })
          .eq('id', id)
        if (error) throw error
      },
      deleteCompany: async (id) => {
        const company = companies.find((c) => c.id === id)
        const { error } = await supabase.from('companies').delete().eq('id', id)
        if (error) {
          if (isForeignKeyViolation(error)) {
            throw new Error(`Can't delete ${company?.name ?? 'this company'} — it still has users or listings attached to it.`)
          }
          throw error
        }
      },
      updateRolePermission: async (role, key, value) => {
        const entry = rolePermissions.find((r) => r.role === role)
        if (!entry) return
        const nextPermissions = { ...entry.permissions, [key]: value }
        await supabase.from('role_permissions').update({ permissions: nextPermissions }).eq('role', role)
        await supabase.from('activity_log').insert({
          id: `al-${crypto.randomUUID()}`,
          actor: 'Braeden Naidoo',
          actor_role: 'admin',
          action: 'updated role permissions for',
          target: entry.label,
          timestamp: new Date().toISOString(),
        })
      },
      logActivity: async (entry) => {
        await supabase.from('activity_log').insert({
          id: `al-${crypto.randomUUID()}`,
          actor: entry.actor,
          actor_role: entry.actorRole,
          action: entry.action,
          target: entry.target,
          timestamp: entry.timestamp,
        })
      },
    }),
    [loading, users, companies, rolePermissions, activityLog],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
