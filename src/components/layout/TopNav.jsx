import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Icon from '../ui/Icon'

const publicLinks = [
  { to: '/library', label: 'Library' },
  { to: '/routines', label: 'Routines' },
  { to: '/calculators', label: 'Calculators' },
  { to: '/articles', label: 'Articles' },
]

const memberLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/history', label: 'History' },
  { to: '/measurements', label: 'Measurements' },
]

export default function TopNav() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const links = isAuthenticated ? [...publicLinks, ...memberLinks] : publicLinks

  const linkClass = ({ isActive }) =>
    `font-label-bold text-label-bold transition-colors active:scale-95 pb-1 ${
      isActive
        ? 'text-primary border-b-2 border-primary'
        : 'text-secondary hover:text-primary-container border-b-2 border-transparent'
    }`

  const handleLogout = () => {
    logout()
    setMenuOpen(false)
    navigate('/')
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface shadow-sm">
      <div className="flex justify-between items-center h-20 px-margin-mobile md:px-margin-desktop max-w-[1280px] mx-auto">
        <div className="flex items-center gap-xl">
          <Link
            to="/"
            className="font-headline-lg text-headline-lg-mobile md:text-headline-lg font-bold text-primary active:scale-95 transition-transform"
          >
            FitTrack
          </Link>
          <div className="hidden lg:flex items-center gap-lg">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} className={linkClass}>
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-sm">
          {isAuthenticated ? (
            <>
              {isAdmin ? (
                <Link
                  to="/admin"
                  className="font-label-bold text-label-bold text-secondary hover:text-primary-container px-sm py-xs transition-colors flex items-center gap-xs"
                >
                  <Icon name="shield_person" size={20} />
                  Admin
                </Link>
              ) : null}
              <Link
                to="/builder"
                className="font-label-bold text-label-bold border border-outline text-on-surface px-md py-sm rounded-lg hover:bg-surface-container transition-colors"
              >
                Build a workout
              </Link>
              <Link
                to="/profile"
                className="flex items-center gap-sm pl-sm font-label-bold text-label-bold text-on-surface hover:text-primary transition-colors"
              >
                <span className="w-9 h-9 rounded-full bg-primary-fixed text-on-primary-fixed-variant flex items-center justify-center font-bold">
                  {(user?.name ?? 'A').charAt(0)}
                </span>
                {user?.name}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Log out"
                className="text-secondary hover:text-error p-xs rounded-full hover:bg-surface-container transition-colors"
              >
                <Icon name="logout" size={20} />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="font-label-bold text-label-bold text-secondary hover:text-primary-container px-sm py-xs transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="font-label-bold text-label-bold bg-primary-container text-on-primary px-lg py-sm rounded-lg hover:bg-primary transition-colors active:scale-95 elev-card border border-surface-variant"
              >
                Sign up free
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="lg:hidden text-primary p-xs active:scale-95 transition-transform"
        >
          <Icon name={menuOpen ? 'close' : 'menu'} />
        </button>
      </div>

      {menuOpen ? (
        <div className="lg:hidden border-t border-surface-variant bg-surface px-margin-mobile py-md flex flex-col gap-xs elev-card">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `font-label-bold text-label-bold py-sm px-sm rounded-lg transition-colors ${
                  isActive ? 'text-primary bg-primary-fixed' : 'text-on-surface hover:bg-surface-container'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <div className="border-t border-surface-variant mt-sm pt-sm flex flex-col gap-sm">
            {isAuthenticated ? (
              <>
                {isAdmin ? (
                  <Link
                    to="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="font-label-bold text-label-bold py-sm px-sm rounded-lg text-on-surface hover:bg-surface-container"
                  >
                    Admin
                  </Link>
                ) : null}
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="font-label-bold text-label-bold py-sm px-sm rounded-lg text-on-surface hover:bg-surface-container"
                >
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="font-label-bold text-label-bold py-sm px-sm rounded-lg text-error text-left hover:bg-error-container"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="font-label-bold text-label-bold py-sm px-sm rounded-lg border border-outline text-center text-on-surface"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="font-label-bold text-label-bold py-sm px-sm rounded-lg bg-primary-container text-on-primary text-center"
                >
                  Sign up free
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </nav>
  )
}
