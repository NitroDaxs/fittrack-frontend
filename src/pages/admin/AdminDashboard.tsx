import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ErrorState, Spinner } from '../../components/ui/States'
import Icon, { type IconName } from '../../components/ui/Icon'
import { useAdminActivity, useAdminStats } from '../../hooks/useAdmin'

// The API names each activity type's icon; these are the Lucide versions.
const activityIcons: Record<string, IconName> = {
  fitness_center: 'dumbbell',
  article: 'file-text',
  person_add: 'user-plus',
  exercise: 'dumbbell',
}

const toneClasses = {
  primary: 'bg-primary-fixed text-primary-container',
  secondary: 'bg-secondary-fixed text-secondary',
  tertiary: 'bg-tertiary-fixed text-tertiary',
  neutral: 'bg-surface-container-high text-on-surface',
}

export default function AdminDashboard() {
  const { t } = useTranslation()
  const { data: stats, isPending, error, refetch } = useAdminStats()
  const { data: activity } = useAdminActivity()

  if (isPending) return <Spinner label={t('admin.dashboard.loadingAdminOverview')} />
  if (error) return <ErrorState error={error} onRetry={refetch} />
  if (!stats) return null

  const cards = [
    { label: t('admin.dashboard.totalExercises'), value: stats.totalExercises, delta: stats.exerciseDelta, icon: 'dumbbell' as const, to: '/admin/exercises', ring: 'bg-primary-fixed' },
    { label: t('admin.dashboard.totalRoutines'), value: stats.totalRoutines, delta: stats.routineDelta, icon: 'calendar-days' as const, to: '/admin/routines', ring: 'bg-secondary-fixed' },
    { label: t('admin.dashboard.publishedArticles'), value: stats.publishedArticles, delta: stats.articleDelta, icon: 'file-text' as const, to: '/admin/articles', ring: 'bg-tertiary-fixed' },
    { label: t('admin.dashboard.totalUsers'), value: stats.totalUsers, delta: stats.userDelta, icon: 'users' as const, to: '/admin/users', ring: 'bg-error-container' },
  ]

  return (
    <>
      <header className="mb-xl">
        <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">{t('admin.dashboard.overview')}</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">{t('admin.dashboard.systemPerformanceAndDailyMetrics')}</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-xl">
        {cards.map((card) => (
          <Link
            key={card.label}
            to={card.to}
            className="glass-card rounded-xl p-md flex flex-col justify-between relative overflow-hidden group hover:border-primary/40 transition-colors"
          >
            <div className={`absolute -right-4 -top-4 w-24 h-24 ${card.ring} rounded-full opacity-40 group-hover:scale-110 transition-transform duration-300`} />
            <div className="flex items-center justify-between mb-md relative z-10">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                {card.label}
              </span>
              <span className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary">
                <Icon name={card.icon} size={20} />
              </span>
            </div>
            <div className="relative z-10">
              <p className="font-display-stat text-display-stat text-on-surface">{card.value}</p>
              <p className="font-label-sm text-label-sm text-tertiary flex items-center gap-1 mt-1">
                <Icon
                  name={card.delta.startsWith('+') ? 'arrow-up' : 'minus'}
                  size={16}
                  className={card.delta.startsWith('+') ? 'text-primary' : 'text-secondary'}
                />
                {card.delta}
              </p>
            </div>
          </Link>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <section className="lg:col-span-2 glass-card rounded-xl p-lg">
          <div className="flex items-center justify-between mb-lg border-b border-surface-variant pb-md">
            <h2 className="font-headline-md text-headline-md text-on-surface">{t('admin.dashboard.recentActivity')}</h2>
          </div>
          <ul className="flex flex-col gap-md">
            {(activity ?? []).map((item) => (
              <li
                key={item.id}
                className="flex items-start gap-md p-sm hover:bg-surface-container-lowest rounded-lg transition-colors border border-transparent hover:border-surface-variant"
              >
                <span
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-1 ${toneClasses[item.tone]}`}
                >
                  <Icon name={activityIcons[item.icon] ?? 'circle'} size={20} />
                </span>
                <span className="flex-1">
                  <span className="block font-body-md text-body-md text-on-surface">{item.text}</span>
                  <span className="block font-label-sm text-label-sm text-on-surface-variant mt-1">{item.meta}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-gutter">
          <div className="glass-card rounded-xl p-lg">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-md">{t('admin.dashboard.systemHealth')}</h2>
            <div className="space-y-md">
              <div>
                <div className="flex justify-between font-label-sm text-label-sm mb-1">
                  <span className="text-on-surface-variant">{t('admin.dashboard.storageCapacity')}</span>
                  <span className="text-primary-container font-bold">{stats.storageCapacity}%</span>
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div className="bg-primary-container h-full rounded-full" style={{ width: `${stats.storageCapacity}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-lg">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-md">{t('admin.dashboard.quickActions')}</h2>
            <div className="flex flex-col gap-sm">
              {[
                { to: '/admin/exercises', label: t('common.addAnExercise'), icon: 'dumbbell' as const },
                { to: '/admin/routines', label: t('admin.dashboard.createARoutine'), icon: 'calendar-days' as const },
                { to: '/admin/articles', label: t('admin.dashboard.draftAnArticle'), icon: 'file-text' as const },
              ].map((action) => (
                <Link
                  key={action.to}
                  to={action.to}
                  className="flex items-center gap-sm px-md py-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors font-label-bold text-label-bold text-on-surface"
                >
                  <Icon name={action.icon} size={20} className="text-primary" />
                  {action.label}
                  <Icon name="chevron-right" size={18} className="ml-auto text-secondary" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
