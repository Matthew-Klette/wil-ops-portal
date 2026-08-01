import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Role, User } from '../data/types'
import { useData } from './DataContext'

const STORAGE_KEY = 'wil-ops:currentUserId'

const DEFAULT_USER_BY_ROLE: Record<Role, string> = {
  admin: 'u-morgan',
  staff: 'u-james',
  client: 'u-priya',
}

interface AuthContextValue {
  currentUser: User | null
  login: (role: Role) => void
  logout: () => void
  switchRole: (role: Role) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { users } = useData()
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY))

  // Devices persist only the chosen user id; the user record itself always
  // comes from the live Supabase-backed list so edits (e.g. deactivation)
  // made by an admin on another device are reflected immediately here too.
  useEffect(() => {
    if (currentUserId) localStorage.setItem(STORAGE_KEY, currentUserId)
    else localStorage.removeItem(STORAGE_KEY)
  }, [currentUserId])

  const currentUser = useMemo(() => users.find((u) => u.id === currentUserId) ?? null, [users, currentUserId])

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      login: (role) => setCurrentUserId(DEFAULT_USER_BY_ROLE[role]),
      logout: () => setCurrentUserId(null),
      switchRole: (role) => setCurrentUserId(DEFAULT_USER_BY_ROLE[role]),
    }),
    [currentUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
