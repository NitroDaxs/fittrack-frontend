import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Icon from '../ui/Icon'

const roles = [
  { key: 'guest', label: 'Guest', icon: 'travel_explore', to: '/' },
  { key: 'member', label: 'Member', icon: 'person', to: '/dashboard' },
  { key: 'admin', label: 'Admin', icon: 'shield_person', to: '/admin' },
]

/**
 * Demo-only control. Real access levels will come from the API session once the
 * Laravel backend is in place; this exists so all three views are reachable
 * without a working login.
 */
export default function DemoRoleSwitcher() {
  const { role, assumeRole } = useAuth()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const select = (next) => {
    assumeRole(next.key)
    setOpen(false)
    navigate(next.to)
  }

  return (
    <div className="fixed z-[90] bottom-20 md:bottom-lg right-md flex flex-col items-end gap-sm print:hidden">
      {open ? (
        <div className="bg-surface-container-lowest border border-surface-variant rounded-xl elev-overlay p-sm w-52">
          <p className="font-label-sm text-label-sm text-secondary uppercase tracking-widest px-sm py-xs">
            Demo: view as
          </p>
          {roles.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => select(item)}
              className={`w-full flex items-center gap-sm px-sm py-sm rounded-lg font-label-bold text-label-bold transition-colors ${
                role === item.key
                  ? 'bg-primary-fixed text-on-primary-fixed-variant'
                  : 'text-on-surface hover:bg-surface-container'
              }`}
            >
              <Icon name={item.icon} size={20} filled={role === item.key} />
              {item.label}
              {role === item.key ? <Icon name="check" size={16} className="ml-auto" /> : null}
            </button>
          ))}
          <p className="font-label-sm text-label-sm text-secondary px-sm pt-xs pb-sm leading-4">
            No real auth — this toggles app state only.
          </p>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Switch demo role"
        className="flex items-center gap-xs bg-inverse-surface text-inverse-on-surface px-md py-sm rounded-full elev-overlay font-label-bold text-label-bold active:scale-95 transition-transform"
      >
        <Icon name={open ? 'close' : 'toggle_on'} size={20} />
        <span className="capitalize">{role}</span>
      </button>
    </div>
  )
}
