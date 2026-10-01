import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { meApi } from '../api/resources'
import { useResource } from '../api/hooks'
import { useAuth } from '../context/AuthContext'
import { useUnits } from '../context/UnitContext'
import StrengthChart from '../components/charts/StrengthChart'
import MeasurementChart from '../components/charts/MeasurementChart'
import ConsistencyHeatmap from '../components/charts/ConsistencyHeatmap'
import { ErrorState, Spinner } from '../components/ui/States'
import Icon from '../components/ui/Icon'

export default function Dashboard() {
  const { user } = useAuth()
  const { weightLabel, showWeight } = useUnits()
  const navigate = useNavigate()
  const [lift, setLift] = useState(null)

  const { data, loading, error, refetch } = useResource(() => meApi.dashboard(), [])
  const { data: workouts } = useResource(() => meApi.workouts({ perPage: 3 }), [])

  if (loading) return <Spinner label="Loading your dashboard" />
  if (error) return <ErrorState error={error} onRetry={refetch} />
  if (!data) return null

  const { stats, strengthProgression, consistency, weightSeries } = data
  // The selected lift falls back to whatever the API actually returned, so we
  // don't depend on a hardcoded lift name that may not exist.
  const lifts = Object.keys(strengthProgression)
  const activeLift = lift && lifts.includes(lift) ? lift : lifts[0] ?? ''
  const series = strengthProgression[activeLift] ?? []
  // Deltas are differences, so convert both ends before subtracting rather
  // than converting the result -- the two are only equal for linear units.
  const delta =
    series.length > 1
      ? Number((showWeight(series[series.length - 1].value) - showWeight(series[0].value)).toFixed(1))
      : 0
  const latestWeight = weightSeries[weightSeries.length - 1]
  const firstWeight = weightSeries[0]
  const weightDelta =
    latestWeight && firstWeight
      ? (showWeight(latestWeight.weight) - showWeight(firstWeight.weight)).toFixed(1)
      : '0.0'

  return (
    <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-lg mb-xl">
        <div>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background tracking-tight">
            Welcome back, {user?.name ?? 'Alex'}!
          </h1>
          <p className="font-body-md text-body-md text-secondary mt-base">Ready to crush your goals today?</p>
        </div>
        <div className="flex flex-wrap gap-md">
          <button
            type="button"
            onClick={() => navigate('/builder')}
            className="flex items-center gap-sm bg-primary text-on-primary font-label-bold text-label-bold px-lg py-md rounded-lg elev-card hover:bg-surface-tint transition-colors"
          >
            <Icon name="play_arrow" size={20} filled />
            Start a workout
          </button>
          <Link
            to="/measurements"
            className="flex items-center gap-sm border border-outline text-on-surface font-label-bold text-label-bold px-lg py-md rounded-lg hover:bg-surface-container transition-colors"
          >
            <Icon name="add" size={20} />
            Log measurements
          </Link>
          <Link
            to="/builder"
            className="flex items-center gap-sm border border-outline text-on-surface font-label-bold text-label-bold px-lg py-md rounded-lg hover:bg-surface-container transition-colors"
          >
            <Icon name="construction" size={20} />
            Build a workout
          </Link>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-xl">
        {[
          { value: stats.streak, label: 'Day Streak' },
          { value: stats.workoutsThisWeek, label: 'Workouts this week' },
          { value: showWeight(stats.latestWeight) ?? '—', unit: weightLabel, label: 'Latest Weight' },
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
              <h2 className="font-headline-md text-headline-md text-on-surface">Strength Progression</h2>
              <p className="font-label-sm text-label-sm text-secondary mt-xs flex items-center gap-xs">
                <Icon name={delta >= 0 ? 'trending_up' : 'trending_down'} size={16} className="text-primary" />
                {delta >= 0 ? '+' : ''}
                {delta} {weightLabel} over six months
              </p>
            </div>
            <label className="sr-only" htmlFor="lift-select">
              Choose a lift
            </label>
            <select
              id="lift-select"
              value={activeLift}
              onChange={(event) => setLift(event.target.value)}
              className="bg-surface-container text-on-surface font-label-sm text-label-sm rounded-lg border-none focus:ring-2 focus:ring-primary py-sm px-md outline-none"
            >
              {Object.keys(strengthProgression).map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-grow min-h-[220px]">
            <StrengthChart data={series} />
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-xl p-lg elev-card border border-surface-container flex flex-col min-h-[340px]">
          <div className="mb-lg">
            <h2 className="font-headline-md text-headline-md text-on-surface">Body Weight</h2>
            <p className="font-label-sm text-label-sm text-secondary mt-xs flex items-center gap-xs">
              <Icon name={Number(weightDelta) <= 0 ? 'arrow_downward' : 'arrow_upward'} size={16} className="text-primary" />
              {weightDelta} {weightLabel} since April
            </p>
          </div>
          <div className="flex-grow min-h-[220px]">
            <MeasurementChart data={weightSeries.map((p) => ({ ...p, weight: showWeight(p.weight) }))} />
          </div>
        </section>

        <section className="lg:col-span-3 bg-surface-container-lowest rounded-xl p-lg elev-card border border-surface-container">
          <div className="flex justify-between items-center mb-lg">
            <h2 className="font-headline-md text-headline-md text-on-surface">Workout Consistency</h2>
            <span className="font-label-sm text-label-sm text-secondary">Last 18 Weeks</span>
          </div>
          <ConsistencyHeatmap days={consistency} />
        </section>
      </div>

      {/* Recent workouts */}
      <section className="mt-xl">
        <div className="flex justify-between items-end mb-lg">
          <h2 className="font-headline-md text-headline-md text-on-surface">Recent Workouts</h2>
          <Link to="/history" className="font-label-bold text-label-bold text-primary hover:text-primary-container">
            View all
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
                <Icon name={workout.icon} />
              </span>
              <span className="min-w-0">
                <span className="block font-label-bold text-label-bold text-on-surface truncate">{workout.name}</span>
                <span className="block font-label-sm text-label-sm text-secondary">
                  {new Date(workout.performedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} •{' '}
                  {workout.minutes} min
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
