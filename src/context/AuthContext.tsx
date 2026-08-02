import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Role, User } from '../data/types'
import { useData } from './DataContext'

const STORAGE_KEY = 'wil-ops:currentUserId'

interface AuthContextValue {
  currentUser: User | null
  loading: boolean
  login: (role: Role) => void
  logout: () => void
  switchRole: (role: Role) => void
  switchToUser: (userId: string) => void
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

  // Resolve a role to a live user rather than a fixed id — a hardcoded id
  // (e.g. "the admin is always u-morgan") breaks the moment that specific
  // user's role is edited in User Management, since the account whose role
  // changed is still the one you're signed in as. Picking any active user
  // who currently holds the target role keeps switching working regardless
  // of which account was edited.
  function findUserForRole(role: Role): User | undefined {
    return users.find((u) => u.role === role && u.active) ?? users.find((u) => u.role === role)
  }

  // While the initial Supabase fetch is in flight, `users` is empty and
  // `currentUser` would look "logged out" even though a session id is
  // already in localStorage — surface `loading` so routing can wait
  // instead of bouncing a refreshed page back to the role picker.
  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      loading: loading && currentUserId !== null,
      login: (role) => {
        const match = findUserForRole(role)
        if (match) setCurrentUserId(match.id)
      },
      logout: () => setCurrentUserId(null),
      switchRole: (role) => {
        const match = findUserForRole(role)
        if (match) setCurrentUserId(match.id)
      },
      switchToUser: (userId) => setCurrentUserId(userId),
    }),
    [currentUser, loading, currentUserId, users],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
