import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Icon from '../components/ui/Icon'
import ProfileMenu from './ProfileMenu'

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
  const { isAuthenticated } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const links = isAuthenticated ? [...publicLinks, ...memberLinks] : publicLinks

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `font-label-bold text-label-bold transition-colors active:scale-95 pb-1 ${
      isActive
        ? 'text-primary border-b-2 border-primary'
        : 'text-secondary hover:text-primary-container border-b-2 border-transparent'
    }`

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

        <div className="flex items-center gap-sm">
          {isAuthenticated ? (
            <>
              <Link
                to="/builder"
                className="hidden md:block font-label-bold text-label-bold border border-outline text-on-surface px-md py-sm rounded-lg hover:bg-surface-container transition-colors"
              >
                Build a workout
              </Link>
              <ProfileMenu />
            </>
          ) : (
            <div className="hidden md:flex items-center gap-sm">
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
            </div>
          )}

          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="lg:hidden text-primary p-xs active:scale-95 transition-transform"
          >
            <Icon name={menuOpen ? 'x' : 'menu'} />
          </button>
        </div>
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
          {!isAuthenticated ? (
            <div className="border-t border-surface-variant mt-sm pt-sm flex flex-col gap-sm">
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
            </div>
          ) : null}
        </div>
      ) : null}
    </nav>
  )
}
