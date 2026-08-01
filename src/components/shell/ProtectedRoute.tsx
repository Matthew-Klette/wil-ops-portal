import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import type { Role } from '../../data/types'

export function ProtectedRoute({ role }: { role: Role }) {
  const { currentUser, loading } = useAuth()

  // A saved session id exists but the shared user list hasn't loaded yet —
  // wait rather than treating this as logged-out, or a page refresh would
  // always bounce back to the role picker.
  if (loading) return null
  if (!currentUser) return <Navigate to="/" replace />
  if (currentUser.role !== role) return <Navigate to={`/${currentUser.role}`} replace />

  return <Outlet />
}
