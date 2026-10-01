import { Link } from 'react-router-dom'
import Icon from './ui/Icon'
import Img from './ui/Img'

const cardShell =
  'bg-surface-container-lowest rounded-xl overflow-hidden elev-card hover:shadow-[0px_8px_24px_rgba(0,0,0,0.1)] transition-shadow group flex flex-col h-full border border-surface-variant'

export function ExerciseCard({ exercise }) {
  return (
    <Link to={`/library/${exercise.slug}`} className={cardShell}>
      {/* 16:9 so object-cover trims the letterboxing baked into YouTube's
          4:3 hqdefault thumbnails -- the bars are exactly the overflow. */}
      <div className="aspect-video w-full bg-surface-container-highest relative overflow-hidden">
        <Img
          src={exercise.image}
          alt={exercise.name}
          icon={exercise.icon}
          imgClassName="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-sm right-sm bg-surface/80 backdrop-blur-sm rounded-full p-xs">
          <Icon name={exercise.icon} size={20} className="text-secondary" />
        </div>
      </div>
      <div className="p-md flex flex-col flex-grow">
        <h3 className="font-headline-md text-headline-md text-on-background mb-xs group-hover:text-primary transition-colors">
          {exercise.name}
        </h3>
        <p className="text-secondary font-body-md text-sm line-clamp-2 mb-md flex-grow">{exercise.description}</p>
        <div className="flex flex-wrap gap-xs mt-auto">
          {exercise.muscleGroups.map((group) => (
            <span
              key={group}
              className="bg-secondary-container text-on-secondary-container px-2 py-1 rounded font-label-sm text-label-sm"
            >
              {group}
            </span>
          ))}
          <span className="bg-surface-container text-secondary px-2 py-1 rounded font-label-sm text-label-sm">
            {exercise.equipment}
          </span>
          <span className="bg-surface-container text-secondary px-2 py-1 rounded font-label-sm text-label-sm">
            {exercise.difficulty}
          </span>
        </div>
      </div>
    </Link>
  )
}

const goalTone = {
  Strength: 'bg-tertiary-container text-on-tertiary-container',
  Hypertrophy: 'bg-secondary-container text-on-secondary-container',
  'Fat Loss': 'bg-primary-container text-on-primary-container',
  Endurance: 'bg-surface-container-high text-on-surface-variant',
  'General Fitness': 'bg-surface-container-high text-on-surface-variant',
}

const goalIcon = {
  Strength: 'bolt',
  Hypertrophy: 'fitness_center',
  'Fat Loss': 'local_fire_department',
  Endurance: 'directions_run',
  'General Fitness': 'favorite',
}

export function RoutineCard({ routine }) {
  return (
    <Link
      to={`/routines/${routine.slug}`}
      className="bg-surface rounded-lg elev-card overflow-hidden group hover:shadow-lg transition-shadow border border-transparent hover:border-outline-variant flex flex-col"
    >
      <div className="h-40 bg-surface-container-low relative">
        <Img
          src={routine.image}
          alt={routine.title}
          icon={routine.icon}
          imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-sm right-sm bg-surface/90 backdrop-blur px-sm py-xs rounded font-label-sm text-label-sm text-on-surface font-bold">
          {routine.daysPerWeek} Days/Wk
        </div>
      </div>
      <div className="p-md flex flex-col flex-grow">
        <h3 className="font-headline-md text-headline-md text-on-surface mb-xs group-hover:text-primary transition-colors">
          {routine.title}
        </h3>
        <p className="font-body-md text-body-md text-on-surface-variant mb-sm line-clamp-2 flex-grow">
          {routine.description}
        </p>
        <div className="flex gap-sm flex-wrap mt-auto">
          <span
            className={`${goalTone[routine.goal] ?? 'bg-surface-container text-secondary'} px-sm py-xs rounded-full font-label-sm text-label-sm flex items-center gap-xs`}
          >
            <Icon name={goalIcon[routine.goal] ?? 'flag'} size={16} />
            {routine.goal}
          </span>
          <span className="bg-surface-variant text-on-surface-variant px-sm py-xs rounded-full font-label-sm text-label-sm flex items-center gap-xs">
            <Icon name="trending_up" size={16} />
            {routine.level}
          </span>
        </div>
      </div>
    </Link>
  )
}

export function ArticleCard({ article, featured = false }) {
  return (
    <Link
      to={`/articles/${article.slug}`}
      className={`${cardShell} ${featured ? 'md:flex-row md:h-auto' : ''}`}
    >
      <div className={`bg-surface-container-highest relative overflow-hidden ${featured ? 'h-56 md:h-auto md:w-1/2' : 'h-44'}`}>
        <Img
          src={article.image}
          alt={article.title}
          icon="article"
          imgClassName="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-md flex flex-col flex-grow">
        <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest mb-xs">
          {article.category}
        </span>
        <h3
          className={`${featured ? 'font-headline-lg-mobile text-headline-lg-mobile' : 'font-headline-md text-headline-md'} text-on-surface mb-xs group-hover:text-primary transition-colors`}
        >
          {article.title}
        </h3>
        <p className="font-body-md text-body-md text-secondary line-clamp-2 mb-md flex-grow">{article.excerpt}</p>
        <div className="flex items-center gap-md text-secondary font-label-sm text-label-sm mt-auto pt-sm border-t border-outline-variant/30">
          <span className="flex items-center gap-xs">
            <Icon name="person" size={16} />
            {article.author}
          </span>
          <span className="flex items-center gap-xs">
            <Icon name="schedule" size={16} />
            {article.readMinutes} min read
          </span>
        </div>
      </div>
    </Link>
  )
}
