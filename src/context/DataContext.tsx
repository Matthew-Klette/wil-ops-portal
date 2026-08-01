import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { ActivityLogEntry, ClientOrg, PermissionKey, Role, RolePermissions, User } from '../data/types'

interface NewUserInput {
  name: string
  email: string
  role: Role
  title: string
  initialColor: string
}

interface DataContextValue {
  loading: boolean
  users: User[]
  clientOrgs: ClientOrg[]
  rolePermissions: RolePermissions[]
  activityLog: ActivityLogEntry[]
  getUserById: (id: string) => User | undefined
  getClientOrgById: (id: string) => ClientOrg | undefined
  createUser: (input: NewUserInput) => Promise<User>
  toggleUserActive: (id: string) => Promise<void>
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
    clientOrgId: row.client_org_id ?? undefined,
    active: row.active,
    lastActive: row.last_active,
    initialColor: row.initial_color,
  }
}

function mapClientOrg(row: any): ClientOrg {
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

export function DataProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [clientOrgs, setClientOrgs] = useState<ClientOrg[]>([])
  const [rolePermissions, setRolePermissions] = useState<RolePermissions[]>([])
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([])

  const refetchUsers = useCallback(async () => {
    const { data } = await supabase.from('users').select('*').order('name')
    setUsers((data ?? []).map(mapUser))
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
      const [orgsRes] = await Promise.all([
        supabase.from('client_orgs').select('*'),
        refetchUsers(),
        refetchRolePermissions(),
        refetchActivityLog(),
      ])
      if (cancelled) return
      setClientOrgs((orgsRes.data ?? []).map(mapClientOrg))
      setLoading(false)
    }
    loadAll()

    const channel = supabase
      .channel('data-context')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => refetchUsers())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'role_permissions' }, () => refetchRolePermissions())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_log' }, () => refetchActivityLog())
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [refetchUsers, refetchRolePermissions, refetchActivityLog])

  const value = useMemo<DataContextValue>(
    () => ({
      loading,
      users,
      clientOrgs,
      rolePermissions,
      activityLog,
      getUserById: (id) => users.find((u) => u.id === id),
      getClientOrgById: (id) => clientOrgs.find((c) => c.id === id),
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
        }
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
    [loading, users, clientOrgs, rolePermissions, activityLog],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
