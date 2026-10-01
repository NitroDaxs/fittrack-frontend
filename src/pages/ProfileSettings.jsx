import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { meApi } from '../api/resources'
import { useResource } from '../api/hooks'
import { useAuth } from '../context/AuthContext'
import { useUnits } from '../context/UnitContext'
import { ErrorState, Spinner } from '../components/ui/States'
import Icon from '../components/ui/Icon'
import Img from '../components/ui/Img'

export default function ProfileSettings() {
  const { logout } = useAuth()
  const { unit, setUnit } = useUnits()
  const navigate = useNavigate()

  const { data: profile, loading, error, refetch, setData } = useResource(() => meApi.profile(), [])
  const { data: saved } = useResource(() => meApi.saved(), [])

  const [notice, setNotice] = useState(null)

  if (loading) return <Spinner label="Loading profile" />
  if (error) return <ErrorState error={error} onRetry={refetch} />
  if (!profile) return null

  const update = async (patch, message) => {
    const next = await meApi.updateProfile(patch)
    setData(next)
    setNotice(message)
    setTimeout(() => setNotice(null), 2500)
  }

  return (
    <div className="max-w-[900px] mx-auto px-margin-mobile md:px-margin-desktop py-xl">
      {/* Identity */}
      <header className="bg-surface-container-lowest rounded-xl p-lg elev-card border border-surface-variant flex flex-col sm:flex-row items-center gap-lg mb-xl">
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary-container shrink-0">
          <Img src={profile.avatar} alt={profile.fullName} icon="person" imgClassName="w-full h-full object-cover" />
        </div>
        <div className="text-center sm:text-left flex-1">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">{profile.name}</h1>
          <p className="font-body-md text-body-md text-secondary">
            {profile.plan}
            {profile.joined ? ` • Joined ${profile.joined}` : null}
          </p>
          {/* Level and title are gamification with no column behind them yet --
              rendered only if the API ever starts sending them, rather than
              printing "Level undefined". */}
          {profile.level || profile.title ? (
            <div className="flex gap-sm mt-sm justify-center sm:justify-start">
              {profile.level ? (
                <span className="bg-primary-fixed text-on-primary-fixed-variant px-sm py-xs rounded-full font-label-sm text-label-sm">
                  Level {profile.level}
                </span>
              ) : null}
              {profile.title ? (
                <span className="bg-secondary-container text-on-secondary-container px-sm py-xs rounded-full font-label-sm text-label-sm">
                  {profile.title}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </header>

      {notice ? (
        <p className="mb-lg bg-primary-fixed text-on-primary-fixed-variant rounded-lg px-md py-sm font-label-bold text-label-bold flex items-center gap-xs">
          <Icon name="check_circle" size={18} filled />
          {notice}
        </p>
      ) : null}

      {/* Saved routines */}
      <section className="mb-xl">
        <div className="flex justify-between items-end mb-md">
          <h2 className="font-headline-md text-headline-md text-on-surface">Saved Routines</h2>
          <Link to="/routines" className="font-label-bold text-label-bold text-primary hover:text-primary-container">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
          {(saved?.routines ?? []).map((routine) => (
            <Link
              key={routine.id}
              to={`/routines/${routine.slug}`}
              className="bg-surface-container-lowest rounded-xl p-md elev-card border border-surface-variant hover:border-primary/40 transition-colors flex items-center gap-md"
            >
              <span className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                <Icon name={routine.icon} />
              </span>
              <span className="min-w-0">
                <span className="block font-label-bold text-label-bold text-on-surface truncate">{routine.title}</span>
                <span className="block font-label-sm text-label-sm text-secondary">
                  {routine.minutes} Min • {routine.level}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Favourite exercises */}
      <section className="mb-xl">
        <h2 className="font-headline-md text-headline-md text-on-surface mb-md">Favorited Exercises</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
          {(saved?.exercises ?? []).map((exercise) => (
            <Link
              key={exercise.id}
              to={`/library/${exercise.slug}`}
              className="bg-surface-container-lowest rounded-xl p-md elev-card border border-surface-variant hover:border-primary/40 transition-colors flex items-center gap-sm"
            >
              <Icon name="favorite" size={20} className="text-primary-container shrink-0" filled />
              <span className="min-w-0">
                <span className="block font-label-bold text-label-bold text-on-surface truncate">{exercise.name}</span>
                <span className="block font-label-sm text-label-sm text-secondary">{exercise.muscleGroups[0]}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Account settings */}
      <section>
        <h2 className="font-headline-md text-headline-md text-on-surface mb-md">Account Settings</h2>
        <div className="bg-surface-container-lowest rounded-xl elev-card border border-surface-variant divide-y divide-surface-variant overflow-hidden">
          <div className="p-md flex items-center justify-between gap-md">
            <div className="flex items-center gap-md min-w-0">
              <Icon name="mail" className="text-secondary shrink-0" />
              <div className="min-w-0">
                <span className="block font-label-bold text-label-bold text-on-surface">Email</span>
                <span className="block font-body-md text-body-md text-secondary truncate">{profile.email}</span>
              </div>
            </div>
            <button
              type="button"
              disabled
              title="Editing lands with the API"
              className="font-label-bold text-label-bold text-secondary px-sm py-xs rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Edit
            </button>
          </div>

          <div className="p-md flex items-center justify-between gap-md">
            <div className="flex items-center gap-md">
              <Icon name="lock" className="text-secondary shrink-0" />
              <div>
                <span className="block font-label-bold text-label-bold text-on-surface">Password</span>
                <span className="block font-body-md text-body-md text-secondary">••••••••</span>
              </div>
            </div>
            <button
              type="button"
              disabled
              title="Password changes require the real API"
              className="font-label-bold text-label-bold text-secondary px-sm py-xs rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Change
            </button>
          </div>

          <div className="p-md flex items-center justify-between gap-md">
            <div className="flex items-center gap-md">
              <Icon name="straighten" className="text-secondary shrink-0" />
              <div>
                <span className="block font-label-bold text-label-bold text-on-surface">Units</span>
                <span className="block font-body-md text-body-md text-secondary">
                  {unit === 'metric' ? 'Metric (kg, cm)' : 'Imperial (lbs, in)'}
                </span>
              </div>
            </div>
            {/* Reads and writes the app-wide preference, so this control and the
                toggles on the calculators/measurements pages stay in step. */}
            <div className="flex rounded-lg border border-surface-variant overflow-hidden shrink-0">
              {['metric', 'imperial'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setUnit(option)}
                  className={`px-md py-xs font-label-bold text-label-bold capitalize transition-colors ${
                    unit === option
                      ? 'bg-primary-container text-on-primary'
                      : 'bg-surface text-secondary hover:bg-surface-container'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="p-md flex items-center justify-between gap-md">
            <div className="flex items-center gap-md">
              <Icon name="notifications_active" className="text-secondary shrink-0" />
              <div>
                <span className="block font-label-bold text-label-bold text-on-surface">Push Notifications</span>
                <span className="block font-body-md text-body-md text-secondary">
                  Not available yet
                </span>
              </div>
            </div>
            {/* There's no `push_notifications` column and PUT /me doesn't accept
                the field, so this toggle used to flip optimistically and silently
                revert on reload. Disabled like the Password row until the API
                supports it. */}
            <button
              type="button"
              role="switch"
              disabled
              aria-checked={false}
              title="Notification preferences require API support"
              className="w-12 h-7 rounded-full p-0.5 transition-colors shrink-0 bg-surface-variant opacity-50 cursor-not-allowed"
            >
              <span
                className="block w-6 h-6 rounded-full bg-surface-container-lowest shadow translate-x-0"
              />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            logout()
            navigate('/')
          }}
          className="mt-lg w-full flex items-center justify-center gap-sm border border-outline text-error font-label-bold text-label-bold py-md rounded-lg hover:bg-error-container transition-colors"
        >
          <Icon name="logout" size={20} />
          Log out
        </button>
      </section>
    </div>
  )
}
