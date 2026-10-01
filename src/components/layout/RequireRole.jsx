import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/**
 * Route guard for the demo. `role` is 'member' or 'admin'. Unauthenticated
 * visitors are bounced to /login with the intended path remembered, matching how
 * the real session guard will behave once the API issues tokens.
 */
export default function RequireRole({ role = 'member', children }) {
  const { isMember, isAdmin } = useAuth()
  const location = useLocation()

  const allowed = role === 'admin' ? isAdmin : isMember

  if (!allowed) {
    return <Navigate to="/login" state={{ from: location.pathname, needs: role }} replace />
  }

  return children
}
