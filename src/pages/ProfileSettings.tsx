import { useTranslation } from 'react-i18next'
import { tLabel } from '../i18n/index'
import { toast } from 'sonner'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSetUnit } from '../hooks/useUnits'
import { useUnitStore } from '../store/unit.store'
import { ErrorState, Spinner } from '../components/ui/States'
import ChangePasswordForm from '../components/profile/ChangePasswordForm'
import EditProfileForm from '../components/profile/EditProfileForm'
import ProfilePicture from '../components/profile/ProfilePicture'
import Icon from '../components/ui/Icon'
import { useProfile, useSaved } from '../hooks/useMe'

export default function ProfileSettings() {
  const { t } = useTranslation()
  const { logout } = useAuth()
  const unit = useUnitStore((state) => state.unit)
  const setUnit = useSetUnit()
  const navigate = useNavigate()

  const { data: profile, isPending: loading, error, refetch } = useProfile()
  const { data: saved } = useSaved()

  if (loading) return <Spinner label={t('profileSettings.loadingProfile')} />
  if (error) return <ErrorState error={error} onRetry={refetch} />
  if (!profile) return null

  return (
    <div className="max-w-[900px] mx-auto px-margin-mobile md:px-margin-desktop py-xl">
      {/* Identity */}
      <header className="bg-surface-container-lowest rounded-xl p-lg elev-card border border-surface-variant flex flex-col sm:flex-row items-center gap-lg mb-xl">
        <ProfilePicture url={profile.avatarUrl} />
        <div className="text-center sm:text-left flex-1">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">{profile.name}</h1>
          <p className="font-body-md text-body-md text-secondary">
            {t('profileSettings.joined', { plan: profile.plan === 'Admin' ? t('common.admin') : t('common.member'), date: profile.joined })}
          </p>
        </div>
      </header>

      {/* Saved routines */}
      <section className="mb-xl">
        <div className="flex justify-between items-end mb-md">
          <h2 className="font-headline-md text-headline-md text-on-surface">{t('profileSettings.savedRoutines')}</h2>
          <Link to="/routines" className="font-label-bold text-label-bold text-primary hover:text-primary-container">
            {t('common.viewAll')}
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
                  {t('common.daysWk', { count: routine.daysPerWeek })} • {tLabel(routine.level)}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Favourite exercises */}
      <section className="mb-xl">
        <h2 className="font-headline-md text-headline-md text-on-surface mb-md">{t('profileSettings.favoritedExercises')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
          {(saved?.exercises ?? []).map((exercise) => (
            <Link
              key={exercise.id}
              to={`/library/${exercise.slug}`}
              className="bg-surface-container-lowest rounded-xl p-md elev-card border border-surface-variant hover:border-primary/40 transition-colors flex items-center gap-sm"
            >
              <Icon name="heart" size={20} className="text-primary-container shrink-0" filled />
              <span className="min-w-0">
                <span className="block font-label-bold text-label-bold text-on-surface truncate">{exercise.name}</span>
                <span className="block font-label-sm text-label-sm text-secondary">{tLabel(exercise.muscleGroups[0] ?? '')}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Account settings */}
      <section>
        <h2 className="font-headline-md text-headline-md text-on-surface mb-md">{t('profileSettings.accountSettings')}</h2>
        <div className="bg-surface-container-lowest rounded-xl elev-card border border-surface-variant divide-y divide-surface-variant overflow-hidden">
          <EditProfileForm key={profile.id} profile={profile} />
          <ChangePasswordForm />

          <div className="p-md flex items-center justify-between gap-md">
            <div className="flex items-center gap-md">
              <Icon name="ruler" className="text-secondary shrink-0" />
              <div>
                <span className="block font-label-bold text-label-bold text-on-surface">{t('common.units')}</span>
                <span className="block font-body-md text-body-md text-secondary">
                  {unit === 'metric' ? t('profileSettings.metricKgCm') : t('profileSettings.imperialLbsIn')}
                </span>
              </div>
            </div>
            {/* Reads and writes the app-wide preference, so this control and the
                toggles on the calculators/measurements pages stay in step. */}
            <div className="flex rounded-lg border border-surface-variant overflow-hidden shrink-0">
              {(['metric', 'imperial'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setUnit(option)
                    toast.success(t('toast.preferencesSaved'))
                  }}
                  className={`px-md py-xs font-label-bold text-label-bold capitalize transition-colors ${
                    unit === option
                      ? 'bg-primary-container text-on-primary'
                      : 'bg-surface text-secondary hover:bg-surface-container'
                  }`}
                >
                  {t(`common.unitSystem.${option}`)} </button>
              ))}
            </div>
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
          <Icon name="log-out" size={20} />
          {t('common.logOut')}
        </button>
      </section>
    </div>
  )
}
