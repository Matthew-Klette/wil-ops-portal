import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Role, User } from '../data/types'
import { useData } from './DataContext'

const STORAGE_KEY = 'wil-ops:currentUserId'

const DEFAULT_USER_BY_ROLE: Record<Role, string> = {
  admin: 'u-morgan',
  recruiter: 'u-james',
  job_seeker: 'u-priya',
}

interface AuthContextValue {
  currentUser: User | null
  loading: boolean
  login: (role: Role) => void
  logout: () => void
  switchRole: (role: Role) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { users, loading } = useData()
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY))

  // Devices persist only the chosen user id; the user record itself always
  // comes from the live Supabase-backed list so edits (e.g. deactivation)
  // made by an admin on another device are reflected immediately here too.
  useEffect(() => {
    if (currentUserId) localStorage.setItem(STORAGE_KEY, currentUserId)
    else localStorage.removeItem(STORAGE_KEY)
  }, [currentUserId])

  const currentUser = useMemo(() => users.find((u) => u.id === currentUserId) ?? null, [users, currentUserId])

  // While the initial Supabase fetch is in flight, `users` is empty and
  // `currentUser` would look "logged out" even though a session id is
  // already in localStorage — surface `loading` so routing can wait
  // instead of bouncing a refreshed page back to the role picker.
  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      loading: loading && currentUserId !== null,
      login: (role) => setCurrentUserId(DEFAULT_USER_BY_ROLE[role]),
      logout: () => setCurrentUserId(null),
      switchRole: (role) => setCurrentUserId(DEFAULT_USER_BY_ROLE[role]),
    }),
    [currentUser, loading, currentUserId],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
