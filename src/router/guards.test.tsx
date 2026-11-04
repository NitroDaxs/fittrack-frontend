import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import RequireGuest from './RequireGuest'
import RequireRole from './RequireRole'

const auth = vi.hoisted(() => ({ isAuthenticated: false, isMember: false, isAdmin: false }))
vi.mock('../context/AuthContext', () => ({ useAuth: () => auth }))

const signIn = (admin = false) => Object.assign(auth, { isAuthenticated: true, isMember: true, isAdmin: admin })

beforeEach(() => {
  Object.assign(auth, { isAuthenticated: false, isMember: false, isAdmin: false })
})

function Where() {
  const location = useLocation()
  return <p>{`at ${location.pathname} from ${(location.state as { from?: string } | null)?.from ?? '-'}`}</p>
}

const renderAt = (entry: string | { pathname: string; state?: unknown }, routes: React.ReactNode) =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        {routes}
        <Route path="*" element={<Where />} />
      </Routes>
    </MemoryRouter>,
  )

describe('RequireRole', () => {
  const routes = (
    <>
      <Route path="/dashboard" element={<RequireRole><p>member page</p></RequireRole>} />
      <Route path="/admin" element={<RequireRole role="admin"><p>admin page</p></RequireRole>} />
    </>
  )

  it('sends guests to login, remembering where they were going', () => {
    renderAt('/admin?tab=users', routes)
    expect(screen.getByText('at /login from /admin?tab=users')).toBeInTheDocument()
  })

  it('lets members into member pages', () => {
    signIn()
    renderAt('/dashboard', routes)
    expect(screen.getByText('member page')).toBeInTheDocument()
  })

  it('sends members away from admin pages to their dashboard', () => {
    signIn()
    renderAt('/admin', <Route path="/admin" element={<RequireRole role="admin"><p>admin page</p></RequireRole>} />)
    expect(screen.getByText('at /dashboard from -')).toBeInTheDocument()
  })

  it('lets admins into admin pages', () => {
    signIn(true)
    renderAt('/admin', routes)
    expect(screen.getByText('admin page')).toBeInTheDocument()
  })
})

describe('RequireGuest', () => {
  const routes = <Route path="/login" element={<RequireGuest><p>login form</p></RequireGuest>} />

  it('shows guest pages to guests', () => {
    renderAt('/login', routes)
    expect(screen.getByText('login form')).toBeInTheDocument()
  })

  it('sends signed-in people to the dashboard', () => {
    signIn()
    renderAt('/login', routes)
    expect(screen.getByText('at /dashboard from -')).toBeInTheDocument()
  })

  it('or back to where they were heading', () => {
    signIn()
    renderAt({ pathname: '/login', state: { from: '/routines/ppl' } }, routes)
    expect(screen.getByText('at /routines/ppl from -')).toBeInTheDocument()
  })
})
