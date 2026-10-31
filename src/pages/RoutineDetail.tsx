import { useTranslation } from 'react-i18next'
import { tLabel } from '../i18n/index'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ErrorState, Spinner } from '../components/ui/States'
import Icon from '../components/ui/Icon'
import Img from '../components/ui/Img'
import { useWorkoutDraft } from '../context/WorkoutContext'
import type { RoutineDay } from '../types/routines'
import { useFavorite } from '../hooks/useFavorite'
import { useRoutine } from '../hooks/useRoutines'

export default function RoutineDetail() {
  const { t } = useTranslation()
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const [activeDay, setActiveDay] = useState(0)
  const { loadRoutineDay } = useWorkoutDraft()

  const { data: routine, isPending: loading, error, refetch } = useRoutine(slug)
  const { isSaved, toggle: toggleSaved, pending: saving, canSave } = useFavorite('routine', routine?.id)

  if (loading) return <Spinner label={t('routineDetail.loadingRoutine')} />
  if (error) return <ErrorState error={error} onRetry={refetch} />
  if (!routine) return null

  const day = routine.days[activeDay] as RoutineDay | undefined

  const startDay = () => {
    if (!day) return
    loadRoutineDay(routine, day)
    navigate('/builder')
  }

  return (
    <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-lg">
      <Link
        to="/routines"
        className="inline-flex items-center gap-xs font-label-bold text-label-bold text-secondary hover:text-primary transition-colors mb-lg"
      >
        <Icon name="arrow-left" size={20} />
        {t('routineDetail.backToRoutines')}
      </Link>

      <header className="relative rounded-xl overflow-hidden mb-xl elev-card">
        <div className="absolute inset-0">
          <Img alt="" icon={routine.icon} imgClassName="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/25" />
        </div>
        <div className="relative z-10 p-lg md:p-xl flex flex-col justify-end min-h-[280px]">
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-white mb-md">
            {routine.title}
          </h1>
          <div className="flex flex-wrap gap-sm">
            <span className="bg-primary-container text-on-primary px-sm py-xs rounded-full font-label-sm text-label-sm">
              {tLabel(routine.goal)}
            </span>
            <span className="bg-white/15 backdrop-blur text-white px-sm py-xs rounded-full font-label-sm text-label-sm">
              {t('routineDetail.daysWeek', { count: routine.daysPerWeek })}
            </span>
            <span className="bg-white/15 backdrop-blur text-white px-sm py-xs rounded-full font-label-sm text-label-sm">
              {tLabel(routine.level)}
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-md mb-xl">
        {[
          { value: routine.daysPerWeek, label: t('routineDetail.daysWk') },
          { value: routine.days.reduce((sum, d) => sum + d.exercises.length, 0), label: t('common.exercises') },
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
        <h2 className="font-headline-md text-headline-md text-on-surface mb-md">{t('routineDetail.weeklySplitOverview')}</h2>
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

      {day ? (
      <section className="bg-surface-container-lowest rounded-xl border border-surface-variant elev-card overflow-hidden mb-xl">
        <header className="flex items-center justify-between p-lg border-b border-surface-variant">
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface">
              {day.focus} ({day.name})
            </h2>
          </div>
          <button
            type="button"
            onClick={startDay}
            className="hidden sm:flex items-center gap-sm bg-primary-container text-on-primary font-label-bold text-label-bold px-lg py-sm rounded-lg hover:bg-primary transition-colors active:scale-95"
          >
            <Icon name="play" size={20} filled />
            {t('routineDetail.loadThisDay')}
          </button>
        </header>

        <ul className="divide-y divide-surface-variant">
          {day.exercises.map((entry, index) => (
            <li key={`${entry.exerciseId}-${index}`} className="p-md flex flex-col sm:flex-row sm:items-center gap-md">
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-surface-container-high shrink-0">
                <Img
                  src={entry.exercise.imageWide}
                  alt=""
                  icon={entry.exercise.icon}
                  imgClassName="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  to={`/library/${entry.exercise.slug}`}
                  className="font-headline-md text-headline-md text-on-surface hover:text-primary transition-colors"
                >
                  {entry.exercise.name}
                </Link>
                {entry.note ? (
                  <p className="font-body-md text-body-md text-secondary text-sm mt-xs">{entry.note}</p>
                ) : null}
              </div>
              <div className="flex gap-lg shrink-0">
                <div className="text-center">
                  <span className="block font-headline-md text-headline-md text-primary">{entry.sets}</span>
                  <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">{t('common.sets')}</span>
                </div>
                <div className="text-center">
                  <span className="block font-headline-md text-headline-md text-primary">{entry.reps}</span>
                  <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">{t('common.reps')}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
      ) : (
        <p className="font-body-md text-body-md text-secondary mb-xl">{t('routineDetail.thisRoutineHasNoProgrammeYet')}</p>
      )}

      <div className="flex flex-col sm:flex-row gap-md">
        <button
          type="button"
          onClick={startDay}
          disabled={!day}
          className="disabled:opacity-40 disabled:cursor-not-allowed flex-1 flex items-center justify-center gap-sm bg-primary-container text-on-primary font-label-bold text-label-bold px-lg py-md rounded-lg hover:bg-primary transition-colors active:scale-95 elev-card"
        >
          <Icon name="play" size={20} filled />
          {t('routineDetail.loadIntoBuilder', { name: day?.name ?? t('common.day2') })}
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
            {isSaved ? t('routineDetail.savedToYourRoutines') : t('routineDetail.saveRoutine')}
          </button>
        ) : (
          <Link
            to="/signup"
            className="flex items-center justify-center gap-sm border border-outline text-on-surface font-label-bold text-label-bold px-lg py-md rounded-lg hover:bg-surface-container transition-colors"
          >
            <Icon name="bookmark" size={20} />
            {t('routineDetail.signUpToSave')}
          </Link>
        )}
      </div>
    </div>
  )
}
