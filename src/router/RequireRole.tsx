import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Route guard. Visitors without the role are sent to /login with the intended
 * path remembered. The API enforces the same rule on every request; this only
 * keeps people away from screens that would fail.
 */
export default function RequireRole({ role = 'member', children }: { role?: 'member' | 'admin'; children: ReactNode }) {
  const { isMember, isAdmin } = useAuth()
  const location = useLocation()

  const allowed = role === 'admin' ? isAdmin : isMember

  if (!allowed) {
    return <Navigate to="/login" state={{ from: location.pathname, needs: role }} replace />
  }

  return children
}
