import { useTranslation } from 'react-i18next'
import { useCallback, useId, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Icon from '../components/ui/Icon'
import { useAuth } from '../context/AuthContext'
import { useDismiss } from '../hooks/useDismiss'
import { useProfile } from '../hooks/useMe'

const itemClass =
  'flex w-full items-center gap-sm rounded-lg px-sm py-sm text-left font-label-bold text-label-bold transition-colors'

export default function ProfileMenu() {
  const { t } = useTranslation()
  const { user, isAdmin, logout } = useAuth()
  // Fresher than the login session, which doesn't change when the profile is edited.
  const { data: profile } = useProfile()
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const panelId = useId()
  const navigate = useNavigate()

  const close = useCallback(() => setOpen(false), [])
  useDismiss(open, close, root, button)

  const handleLogout = () => {
    close()
    logout()
    navigate('/')
  }

  const role = isAdmin ? t('common.admin') : t('common.member')

  return (
    <div ref={root} className="relative">
      <button
        ref={button}
        type="button"
        aria-label={t('nav.accountMenu')}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors active:scale-95 ${
          open
            ? 'border-primary bg-primary-fixed text-primary'
            : 'border-outline-variant text-on-surface-variant hover:bg-surface-container hover:text-primary'
        }`}
      >
        <Icon name="user" size={20} />
      </button>

      {open ? (
        <div
          id={panelId}
          className="absolute right-0 top-full z-50 mt-sm w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-surface-variant bg-surface-container-lowest p-sm elev-overlay"
        >
          <div className="flex items-center gap-sm p-sm">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-on-primary-fixed-variant">
              <Icon name="user" size={20} />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-label-bold text-label-bold text-on-surface">
                {profile?.name ?? user?.name}
              </span>
              <span className="block truncate font-label-sm text-label-sm text-on-surface-variant">
                {profile?.email ?? user?.email}
              </span>
            </span>
          </div>

          <p className="px-sm pb-sm font-label-sm text-label-sm text-on-surface-variant">
            {profile?.joined ? t('nav.joined', { role, date: profile.joined }) : role}
          </p>

          <div className="flex flex-col gap-xs border-t border-surface-variant pt-xs">
            <Link to="/profile" onClick={close} className={`${itemClass} text-on-surface hover:bg-surface-container`}>
              <Icon name="settings" size={18} />
              {t('nav.profileSettings')}
            </Link>
            {isAdmin ? (
              <Link to="/admin" onClick={close} className={`${itemClass} text-on-surface hover:bg-surface-container`}>
                <Icon name="shield-user" size={18} />
                {t('nav.adminConsole')}
              </Link>
            ) : null}
          </div>

          <div className="mt-xs border-t border-surface-variant pt-xs">
            <button type="button" onClick={handleLogout} className={`${itemClass} text-error hover:bg-error-container`}>
              <Icon name="log-out" size={18} />
              {t('common.logOut')}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
