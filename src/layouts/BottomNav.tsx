import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Icon, { type IconName } from '../components/ui/Icon'

interface NavItem {
  to: string
  label: string
  icon: IconName
}

const guestItems: NavItem[] = [
  { to: '/library', label: 'Library', icon: 'book-open' },
  { to: '/routines', label: 'Routines', icon: 'list' },
  { to: '/calculators', label: 'Calculators', icon: 'calculator' },
  { to: '/articles', label: 'Articles', icon: 'file-text' },
]

const memberItems: NavItem[] = [
  { to: '/dashboard', label: 'Workout', icon: 'dumbbell' },
  { to: '/history', label: 'History', icon: 'history' },
  { to: '/measurements', label: 'Stats', icon: 'chart-line' },
  { to: '/profile', label: 'Settings', icon: 'settings' },
]

export default function BottomNav() {
  const { isAuthenticated } = useAuth()
  const items = isAuthenticated ? memberItems : guestItems

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center bg-surface border-t border-surface-variant h-16 shadow-[0px_-4px_20px_rgba(0,0,0,0.05)]">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform ${
              isActive ? 'text-primary' : 'text-secondary hover:text-primary'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon name={item.icon} size={24} filled={isActive} />
              <span className="text-[10px] font-label-bold">{item.label}</span>
              {isActive ? <span className="w-1 h-1 bg-primary rounded-full" /> : null}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
