import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Icon, { type IconName } from '../components/ui/Icon'
import LanguageSwitcher from '../components/ui/LanguageSwitcher'
import ProfileMenu from './ProfileMenu'

const navItems: { to: string; label: string; icon: IconName; end?: boolean }[] = [
  { to: '/admin', label: 'nav.dashboard', icon: 'layout-dashboard', end: true },
  { to: '/admin/exercises', label: 'common.exercises', icon: 'dumbbell' },
  { to: '/admin/routines', label: 'nav.routines', icon: 'calendar-days' },
  { to: '/admin/articles', label: 'nav.articles', icon: 'file-text' },
  { to: '/admin/users', label: 'nav.users', icon: 'users' },
]

export default function AdminLayout() {
  const { t } = useTranslation()
  const { logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  const itemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-md py-sm rounded-lg transition-all font-label-bold text-label-bold ${
      isActive
        ? 'text-primary bg-primary-fixed font-bold'
        : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-highest'
    }`

  const sidebar = (
    <>
      <div className="flex items-center gap-3 mb-xl px-2">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold shrink-0">
          FA
        </div>
        <div>
          <h1 className="font-headline-md text-headline-md font-bold text-primary">{t('nav.fittrackAdmin')}</h1>
          <p className="font-label-sm text-label-sm text-on-surface-variant">{t('nav.systemManagement')}</p>
        </div>
      </div>

      <nav className="flex flex-col gap-sm flex-grow">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={itemClass} onClick={() => setSidebarOpen(false)}>
            {({ isActive }) => (
              <>
                <Icon name={item.icon} size={24} filled={isActive} />
                <span>{t(item.label)}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto border-t border-outline-variant pt-md flex flex-col gap-xs">
        <NavLink to="/" className="flex items-center gap-3 px-md py-xs text-on-surface-variant hover:text-primary transition-colors rounded-lg">
          <Icon name="globe" size={20} />
          <span className="font-label-bold text-label-bold">{t('nav.viewSite')}</span>
        </NavLink>
        <button
          type="button"
          onClick={() => {
            logout()
            navigate('/')
          }}
          className="flex items-center gap-3 px-md py-xs text-on-surface-variant hover:text-error transition-colors rounded-lg text-left"
        >
          <Icon name="log-out" size={20} />
          <span className="font-label-bold text-label-bold">{t('nav.logout')}</span>
        </button>
      </div>
    </>
  )

  return (
    <div className="bg-background text-on-background min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant shadow-sm flex-col py-lg px-md z-50 hidden md:flex">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {sidebarOpen ? (
        <div className="md:hidden fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-on-surface/20" onClick={() => setSidebarOpen(false)} />
          <aside className="relative h-full w-72 bg-surface-container-low border-r border-outline-variant flex flex-col py-lg px-md elev-overlay">
            {sidebar}
          </aside>
        </div>
      ) : null}

      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <header className="bg-surface shadow-sm flex justify-between items-center h-16 px-margin-mobile md:px-margin-desktop sticky top-0 z-40 border-b border-outline-variant">
          <div className="flex items-center md:hidden">
            <button
              type="button"
              aria-label={t('nav.openNavigation')}
              onClick={() => setSidebarOpen(true)}
              className="text-on-surface-variant p-xs hover:bg-surface-container rounded-full transition-all"
            >
              <Icon name="menu" />
            </button>
            <span className="font-headline-md text-headline-md font-extrabold text-on-surface ml-sm">{t('nav.fittrackAdmin')}</span>
          </div>

          <div className="hidden md:block" />

          <div className="flex items-center gap-sm">
            <LanguageSwitcher />
            <ProfileMenu />
          </div>
        </header>

        <div className="flex-1 p-margin-mobile md:p-margin-desktop overflow-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </div>

    </div>
  )
}
