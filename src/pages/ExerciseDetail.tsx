import { useTranslation } from 'react-i18next'
import { tLabel } from '../i18n/index'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ErrorState, Spinner } from '../components/ui/States'
import Icon from '../components/ui/Icon'
import VideoEmbed from '../components/ui/VideoEmbed'
import { useAuth } from '../context/AuthContext'
import { useWorkoutDraft } from '../context/WorkoutContext'
import { useExercise, useExercises } from '../hooks/useExercises'
import { useFavorite } from '../hooks/useFavorite'

export default function ExerciseDetail() {
  const { t } = useTranslation()
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const { isMember } = useAuth()
  const { addExercise } = useWorkoutDraft()

  const { data: exercise, isPending: loading, error, refetch } = useExercise(slug)
  const primaryMuscle = exercise?.muscleGroups[0]
  const { data: relatedData } = useExercises({ muscleGroups: primaryMuscle ? [primaryMuscle] : [], perPage: 5 }, Boolean(primaryMuscle))
  const { isSaved, toggle: toggleSaved, pending: saving, canSave } = useFavorite('exercise', exercise?.id)

  if (loading) return <Spinner label={t('exerciseDetail.loadingExercise')} />
  if (error) return <ErrorState error={error} onRetry={refetch} />
  if (!exercise) return null

  const related = (relatedData?.data ?? []).filter((item) => item.id !== exercise.id).slice(0, 4)

  const addToBuilder = () => {
    addExercise(exercise)
    navigate('/builder')
  }

  return (
    <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-lg">
      <Link
        to="/library"
        className="inline-flex items-center gap-xs font-label-bold text-label-bold text-secondary hover:text-primary transition-colors mb-lg"
      >
        <Icon name="arrow-left" size={20} />
        {t('common.library')}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl mb-xl">
        <VideoEmbed
          videoId={exercise.videoId}
          poster={exercise.image}
          title={exercise.name}
          icon={exercise.icon}
        />

        <div className="flex flex-col">
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-sm">
            {exercise.name}
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-lg">{exercise.description}</p>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-md mb-lg">
            <div className="bg-surface-container-lowest rounded-xl p-md border border-surface-variant elev-card">
              <dt className="font-label-sm text-label-sm text-secondary uppercase tracking-widest mb-xs flex items-center gap-xs">
                <Icon name="dumbbell" size={16} />{' '}{t('exerciseDetail.primaryMuscle')}
              </dt>
              <dd className="font-label-bold text-label-bold text-on-surface">{tLabel(exercise.primaryMuscles)}</dd>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-md border border-surface-variant elev-card">
              <dt className="font-label-sm text-label-sm text-secondary uppercase tracking-widest mb-xs flex items-center gap-xs">
                <Icon name="dumbbell" size={16} />{' '}{t('common.equipment')}
              </dt>
              <dd className="font-label-bold text-label-bold text-on-surface">{tLabel(exercise.equipment)}</dd>
            </div>
          </dl>

          <div className="flex flex-wrap gap-sm mb-lg">
            {exercise.muscleGroups.map((group) => (
              <span
                key={tLabel(group)}
                className="bg-secondary-container text-on-secondary-container px-sm py-xs rounded-full font-label-sm text-label-sm"
              >
                {tLabel(group)}
              </span>
            ))}
            <span className="bg-surface-container text-secondary px-sm py-xs rounded-full font-label-sm text-label-sm">
              {tLabel(exercise.difficulty)}
            </span>
          </div>

          <div className="flex flex-wrap gap-sm mt-auto">
            <button
              type="button"
              onClick={addToBuilder}
              className="flex items-center gap-sm bg-primary-container text-on-primary font-label-bold text-label-bold px-lg py-md rounded-lg hover:bg-primary transition-colors active:scale-95 elev-card"
            >
              <Icon name="plus" size={20} />
              {t('exerciseDetail.addToWorkout')}
            </button>
            <Link
              to={isMember ? '/history' : '/signup'}
              className="flex items-center gap-sm border border-outline text-on-surface font-label-bold text-label-bold px-lg py-md rounded-lg hover:bg-surface-container transition-colors"
            >
              <Icon name="list" size={20} />
              {isMember ? t('exerciseDetail.viewMyLog') : t('exerciseDetail.trackYourLifts')}
            </Link>
            {canSave ? (
              <button
                type="button"
                onClick={toggleSaved}
                disabled={saving}
                aria-pressed={isSaved}
                aria-label={isSaved ? t('exerciseDetail.removeFromFavorites') : t('exerciseDetail.addToFavorites')}
                className={`flex items-center gap-sm border font-label-bold text-label-bold px-lg py-md rounded-lg transition-colors disabled:opacity-60 ${
                  isSaved
                    ? 'border-primary bg-primary-fixed text-on-primary-fixed-variant'
                    : 'border-outline text-on-surface hover:bg-surface-container'
                }`}
              >
                <Icon name="heart" size={20} filled={isSaved} />
                {isSaved ? t('exerciseDetail.favorited') : t('exerciseDetail.favorite')}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mb-xl">
        <section className="bg-surface-container-lowest rounded-xl p-lg border border-surface-variant elev-card">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-lg">{t('exerciseDetail.howToPerformIt')}</h2>
          <ol className="space-y-lg">
            {exercise.steps.map((step, index) => (
              <li key={step.title} className="flex gap-md">
                <span className="w-8 h-8 rounded-full bg-primary-fixed text-on-primary-fixed-variant flex items-center justify-center font-label-bold text-label-bold shrink-0">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-label-bold text-label-bold text-on-surface mb-xs">{step.title}</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

      </div>

      {related.length > 0 ? (
        <section>
          <div className="flex justify-between items-end mb-lg">
            <h2 className="font-headline-md text-headline-md text-on-surface">{t('exerciseDetail.relatedExercises')}</h2>
            <Link to="/library" className="font-label-bold text-label-bold text-primary hover:text-primary-container">
              {t('exerciseDetail.seeAll')}
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-md">
            {related.map((item) => (
              <Link
                key={item.id}
                to={`/library/${item.slug}`}
                className="bg-surface-container-lowest rounded-xl border border-surface-variant elev-card p-md hover:border-primary/40 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary mb-sm">
                  <Icon name={item.icon} size={20} />
                </div>
                <h3 className="font-label-bold text-label-bold text-on-surface group-hover:text-primary transition-colors mb-xs">
                  {item.name}
                </h3>
                <p className="font-label-sm text-label-sm text-secondary">
                  {tLabel(item.equipment)} • {tLabel(item.muscleGroups[0] ?? '')}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
