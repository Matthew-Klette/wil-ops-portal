import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import type { Role } from '../../data/types'

export function ProtectedRoute({ role }: { role: Role }) {
  const { currentUser } = useAuth()

  if (!currentUser) return <Navigate to="/" replace />
  if (currentUser.role !== role) return <Navigate to={`/${currentUser.role}`} replace />

  return <Outlet />
}
