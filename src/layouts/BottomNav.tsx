import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Icon, { type IconName } from '../components/ui/Icon'

interface NavItem {
  to: string
  label: string
  icon: IconName
}

const guestItems: NavItem[] = [
  { to: '/library', label: 'common.library', icon: 'book-open' },
  { to: '/routines', label: 'nav.routines', icon: 'list' },
  { to: '/calculators', label: 'common.calculators', icon: 'calculator' },
  { to: '/articles', label: 'nav.articles', icon: 'file-text' },
]

const memberItems: NavItem[] = [
  { to: '/dashboard', label: 'nav.workout', icon: 'dumbbell' },
  { to: '/history', label: 'nav.history', icon: 'history' },
  { to: '/measurements', label: 'nav.stats', icon: 'chart-line' },
  { to: '/profile', label: 'nav.settings', icon: 'settings' },
]

export default function BottomNav() {
  const { t } = useTranslation()
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
              <span className="text-[10px] font-label-bold">{t(item.label)}</span>
              {isActive ? <span className="w-1 h-1 bg-primary rounded-full" /> : null}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
