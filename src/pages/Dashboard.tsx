import { useTranslation } from 'react-i18next'
import i18n from '../i18n/index'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useUnitFormat } from '../hooks/useUnits'
import StrengthChart from '../components/charts/StrengthChart'
import MeasurementChart from '../components/charts/MeasurementChart'
import ConsistencyHeatmap from '../components/charts/ConsistencyHeatmap'
import { ErrorState, Spinner } from '../components/ui/States'
import Icon from '../components/ui/Icon'
import { useDashboard, useWorkouts } from '../hooks/useMe'

/** The difference between two converted values, to one decimal. */
const change = (from: number | null, to: number | null): number =>
  from === null || to === null ? 0 : Number((to - from).toFixed(1))

export default function Dashboard() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { weightLabel, showWeight } = useUnitFormat()
  const navigate = useNavigate()

  const { data, isPending: loading, error, refetch } = useDashboard()
  const { data: workouts } = useWorkouts({ perPage: 3 })

  if (loading) return <Spinner label={t('dashboard.loadingYourDashboard')} />
  if (error) return <ErrorState error={error} onRetry={refetch} />
  if (!data) return null

  const { stats, strength, consistency, weightSeries } = data
  const series = strength?.series ?? []
  const delta = change(showWeight(series[0]?.value), showWeight(series[series.length - 1]?.value))
  const weighedDays = weightSeries.filter((point) => point.weight !== null)
  const weightDelta = change(
    showWeight(weighedDays[0]?.weight),
    showWeight(weighedDays[weighedDays.length - 1]?.weight),
  )

  return (
    <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-lg mb-xl">
        <div>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background tracking-tight">
            {user ? t('dashboard.welcomeBack2', { name: user.name }) : t('dashboard.welcomeBack')}
          </h1>
          <p className="font-body-md text-body-md text-secondary mt-base">{t('dashboard.readyToCrushYourGoalsToday')}</p>
        </div>
        <div className="flex flex-wrap gap-md">
          <button
            type="button"
            onClick={() => navigate('/builder')}
            className="flex items-center gap-sm bg-primary text-on-primary font-label-bold text-label-bold px-lg py-md rounded-lg elev-card hover:bg-surface-tint transition-colors"
          >
            <Icon name="play" size={20} filled />
            {t('dashboard.startAWorkout')}
          </button>
          <Link
            to="/measurements"
            className="flex items-center gap-sm border border-outline text-on-surface font-label-bold text-label-bold px-lg py-md rounded-lg hover:bg-surface-container transition-colors"
          >
            <Icon name="plus" size={20} />
            {t('dashboard.logMeasurements')}
          </Link>
          <Link
            to="/builder"
            className="flex items-center gap-sm border border-outline text-on-surface font-label-bold text-label-bold px-lg py-md rounded-lg hover:bg-surface-container transition-colors"
          >
            <Icon name="list-plus" size={20} />
            {t('common.buildAWorkout')}
          </Link>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-xl">
        {[
          { value: stats.streak, label: t('dashboard.dayStreak') },
          { value: stats.workoutsThisWeek, label: t('dashboard.workoutsThisWeek') },
          { value: showWeight(stats.latestWeight) ?? '—', unit: weightLabel, label: t('dashboard.latestWeight') },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-surface-container-lowest rounded-xl p-lg elev-card border border-surface-container flex flex-col justify-center items-center text-center"
          >
            <div className="flex items-baseline gap-base">
              <span className="font-display-stat text-display-stat text-on-surface">{stat.value}</span>
              {stat.unit ? <span className="font-headline-md text-headline-md text-secondary">{stat.unit}</span> : null}
            </div>
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest mt-sm">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        <section className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-lg elev-card border border-surface-container flex flex-col min-h-[340px]">
          <div className="flex flex-wrap gap-sm justify-between items-center mb-lg">
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface">
                {t('dashboard.strengthProgression')}{strength ? ` — ${strength.lift}` : ''}
              </h2>
              <p className="font-label-sm text-label-sm text-secondary mt-xs flex items-center gap-xs">
                <Icon name={delta >= 0 ? 'trending-up' : 'trending-down'} size={16} className="text-primary" />
                {delta >= 0 ? '+' : ''}
                {delta} {weightLabel}{' '}{t('dashboard.sinceYourFirstLoggedSession')}
              </p>
            </div>
          </div>
          <div className="flex-grow min-h-[220px]">
            <StrengthChart data={series} />
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-xl p-lg elev-card border border-surface-container flex flex-col min-h-[340px]">
          <div className="mb-lg">
            <h2 className="font-headline-md text-headline-md text-on-surface">{t('dashboard.bodyWeight')}</h2>
            <p className="font-label-sm text-label-sm text-secondary mt-xs flex items-center gap-xs">
              <Icon name={weightDelta <= 0 ? 'arrow-down' : 'arrow-up'} size={16} className="text-primary" />
              {weightDelta} {weightLabel}{' '}{t('dashboard.acrossYourRecentEntries')}
            </p>
          </div>
          <div className="flex-grow min-h-[220px]">
            <MeasurementChart data={weightSeries.map((p) => ({ ...p, weight: showWeight(p.weight) }))} />
          </div>
        </section>

        <section className="lg:col-span-3 bg-surface-container-lowest rounded-xl p-lg elev-card border border-surface-container">
          <div className="flex justify-between items-center mb-lg">
            <h2 className="font-headline-md text-headline-md text-on-surface">{t('dashboard.workoutConsistency')}</h2>
            <span className="font-label-sm text-label-sm text-secondary">{t('dashboard.last90Days')}</span>
          </div>
          <ConsistencyHeatmap days={consistency} />
        </section>
      </div>

      {/* Recent workouts */}
      <section className="mt-xl">
        <div className="flex justify-between items-end mb-lg">
          <h2 className="font-headline-md text-headline-md text-on-surface">{t('dashboard.recentWorkouts')}</h2>
          <Link to="/history" className="font-label-bold text-label-bold text-primary hover:text-primary-container">
            {t('dashboard.viewAll')}
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          {(workouts?.data ?? []).slice(0, 3).map((workout) => (
            <Link
              key={workout.id}
              to="/history"
              className="bg-surface-container-lowest rounded-xl p-md elev-card border border-surface-variant hover:border-primary/40 transition-colors flex items-center gap-md"
            >
              <span className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                <Icon name="dumbbell" />
              </span>
              <span className="min-w-0">
                <span className="block font-label-bold text-label-bold text-on-surface truncate">{workout.name}</span>
                <span className="block font-label-sm text-label-sm text-secondary">
                  {new Date(workout.performedAt).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' })} •{' '}
                  {workout.minutes ?? '—'}{' '}{t('dashboard.min')}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
