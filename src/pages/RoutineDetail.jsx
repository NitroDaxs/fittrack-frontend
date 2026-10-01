import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { routinesApi } from '../api/resources'
import { useResource } from '../api/hooks'
import { useFavorite } from '../api/useFavorite'
import { ErrorState, Spinner } from '../components/ui/States'
import Icon from '../components/ui/Icon'
import Img from '../components/ui/Img'
import { useWorkoutDraft } from '../context/WorkoutContext'

export default function RoutineDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [activeDay, setActiveDay] = useState(0)
  const { loadRoutineDay } = useWorkoutDraft()

  const { data: routine, loading, error, refetch } = useResource(() => routinesApi.show(slug), [slug])
  const { isSaved, toggle: toggleSaved, pending: saving, canSave } = useFavorite('routine', routine?.id)

  if (loading) return <Spinner label="Loading routine" />
  if (error) return <ErrorState error={error} onRetry={refetch} />
  if (!routine) return null

  const day = routine.days[activeDay]

  const startDay = () => {
    loadRoutineDay(routine, day)
    navigate('/builder')
  }

  return (
    <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-lg">
      <Link
        to="/routines"
        className="inline-flex items-center gap-xs font-label-bold text-label-bold text-secondary hover:text-primary transition-colors mb-lg"
      >
        <Icon name="arrow_back" size={20} />
        Back to Routines
      </Link>

      <header className="relative rounded-xl overflow-hidden mb-xl elev-card">
        <div className="absolute inset-0">
          <Img src={routine.image} alt="" icon={routine.icon} imgClassName="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/25" />
        </div>
        <div className="relative z-10 p-lg md:p-xl flex flex-col justify-end min-h-[280px]">
          <span className="font-label-sm text-label-sm text-white/80 uppercase tracking-widest mb-xs">
            {routine.subtitle}
          </span>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-white mb-md">
            {routine.title}
          </h1>
          <div className="flex flex-wrap gap-sm">
            <span className="bg-primary-container text-on-primary px-sm py-xs rounded-full font-label-sm text-label-sm">
              {routine.goal}
            </span>
            <span className="bg-white/15 backdrop-blur text-white px-sm py-xs rounded-full font-label-sm text-label-sm">
              {routine.daysPerWeek} Days/Week
            </span>
            <span className="bg-white/15 backdrop-blur text-white px-sm py-xs rounded-full font-label-sm text-label-sm">
              {routine.level}
            </span>
            <span className="bg-white/15 backdrop-blur text-white px-sm py-xs rounded-full font-label-sm text-label-sm">
              {routine.durationLabel}
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-md mb-xl">
        {[
          { value: routine.daysPerWeek, label: 'Days/Wk' },
          { value: routine.weeks, label: 'Weeks' },
          { value: routine.minutes, label: 'Avg Minutes' },
          { value: routine.days.reduce((sum, d) => sum + d.exercises.length, 0), label: 'Exercises' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-surface-container-lowest rounded-xl p-lg elev-card border border-surface-variant flex flex-col items-center text-center"
          >
            <span className="font-display-stat text-headline-lg text-on-surface">{stat.value}</span>
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest mt-xs">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl mb-xl">{routine.description}</p>

      <section className="mb-xl">
        <h2 className="font-headline-md text-headline-md text-on-surface mb-md">Weekly Split Overview</h2>
        <div className="flex gap-sm overflow-x-auto pb-sm no-scrollbar">
          {routine.days.map((item, index) => (
            <button
              key={item.name}
              type="button"
              onClick={() => setActiveDay(index)}
              className={`shrink-0 text-left rounded-xl p-md border transition-colors min-w-[180px] ${
                index === activeDay
                  ? 'bg-primary-fixed border-primary text-on-primary-fixed-variant'
                  : 'bg-surface-container-lowest border-surface-variant text-on-surface hover:border-primary/40'
              }`}
            >
              <span className="font-label-sm text-label-sm uppercase tracking-widest opacity-70">{item.name}</span>
              <span className="block font-headline-md text-headline-md mt-xs">{item.focus}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="bg-surface-container-lowest rounded-xl border border-surface-variant elev-card overflow-hidden mb-xl">
        <header className="flex items-center justify-between p-lg border-b border-surface-variant">
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface">
              {day.focus} ({day.name})
            </h2>
            {day.minutes ? (
              <p className="font-label-sm text-label-sm text-secondary flex items-center gap-xs mt-xs">
                <Icon name="timer" size={16} />
                {day.minutes} Min
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={startDay}
            className="hidden sm:flex items-center gap-sm bg-primary-container text-on-primary font-label-bold text-label-bold px-lg py-sm rounded-lg hover:bg-primary transition-colors active:scale-95"
          >
            <Icon name="play_arrow" size={20} filled />
            Load this day
          </button>
        </header>

        <ul className="divide-y divide-surface-variant">
          {day.exercises.map((entry, index) => (
            <li key={`${entry.exerciseId}-${index}`} className="p-md flex flex-col sm:flex-row sm:items-center gap-md">
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-surface-container-high shrink-0">
                <Img
                  src={entry.exercise?.imageWide ?? entry.exercise?.image}
                  alt=""
                  icon={entry.exercise?.icon ?? 'fitness_center'}
                  imgClassName="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                {entry.exercise ? (
                  <Link
                    to={`/library/${entry.exercise.slug}`}
                    className="font-headline-md text-headline-md text-on-surface hover:text-primary transition-colors"
                  >
                    {entry.exercise.name}
                  </Link>
                ) : (
                  <span className="font-headline-md text-headline-md text-on-surface">Exercise {entry.exerciseId}</span>
                )}
                {entry.note ? (
                  <p className="font-body-md text-body-md text-secondary text-sm mt-xs">{entry.note}</p>
                ) : null}
              </div>
              <div className="flex gap-lg shrink-0">
                <div className="text-center">
                  <span className="block font-headline-md text-headline-md text-primary">{entry.sets}</span>
                  <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">Sets</span>
                </div>
                <div className="text-center">
                  <span className="block font-headline-md text-headline-md text-primary">{entry.reps}</span>
                  <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">Reps</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-col sm:flex-row gap-md">
        <button
          type="button"
          onClick={startDay}
          className="flex-1 flex items-center justify-center gap-sm bg-primary-container text-on-primary font-label-bold text-label-bold px-lg py-md rounded-lg hover:bg-primary transition-colors active:scale-95 elev-card"
        >
          <Icon name="play_arrow" size={20} filled />
          Load {day.name} into builder
        </button>
        {canSave ? (
          <button
            type="button"
            onClick={toggleSaved}
            disabled={saving}
            aria-pressed={isSaved}
            className={`flex items-center justify-center gap-sm border font-label-bold text-label-bold px-lg py-md rounded-lg transition-colors disabled:opacity-60 ${
              isSaved
                ? 'border-primary bg-primary-fixed text-on-primary-fixed-variant'
                : 'border-outline text-on-surface hover:bg-surface-container'
            }`}
          >
            <Icon name="bookmark" size={20} filled={isSaved} />
            {isSaved ? 'Saved to your routines' : 'Save routine'}
          </button>
        ) : (
          <Link
            to="/signup"
            className="flex items-center justify-center gap-sm border border-outline text-on-surface font-label-bold text-label-bold px-lg py-md rounded-lg hover:bg-surface-container transition-colors"
          >
            <Icon name="bookmark" size={20} />
            Sign up to save
          </Link>
        )}
      </div>
    </div>
  )
}
