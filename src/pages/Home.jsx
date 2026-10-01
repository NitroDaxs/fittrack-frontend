import { Link } from 'react-router-dom'
import { routinesApi } from '../api/resources'
import { useResource } from '../api/hooks'
import { RoutineCard } from '../components/cards'
import { SkeletonCard } from '../components/ui/States'
import Icon from '../components/ui/Icon'
import Img from '../components/ui/Img'

const heroImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA2r1u89fi_WJDaENJkStZCajqT8QBjZ6jAsDJwxmlOFbNth1K6tXp_agWld0hazUAdWENSDwZH2UV1M3s1rIi3bzRGAH6tLMxOobPh_85W371_vwqHN-pfabSCjJuyCPjoxbfEq4DlsnKq1xayO_McgICgN9TSyzBI7lfhS8Q3XdX_IcGpxjiopo3bvnUS_WuQBbCMMhM1HYBqz0HBwTS9JY-jj0AehNadzcN6MnLDJ7wgFsrmhFv06dRzYSLAF4AaRkKCPfIKdYkP'

const features = [
  { icon: 'library_books', title: 'Exercise Library', body: 'Hundreds of movements with setup cues, coaching tips, and difficulty ratings.', to: '/library' },
  { icon: 'event_note', title: 'Proven Routines', body: 'Structured programmes for muscle gain, fat loss, strength, and endurance.', to: '/routines' },
  { icon: 'monitoring', title: 'Progress Tracking', body: 'Strength curves, body measurements, and a consistency heatmap that keeps you honest.', to: '/dashboard' },
  { icon: 'calculate', title: 'Training Calculators', body: 'Estimate your one-rep max and daily calorie needs in seconds.', to: '/calculators' },
]

export default function Home() {
  const { data, loading } = useResource(() => routinesApi.list({ perPage: 3 }), [])
  const routines = data?.data ?? []

  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <header className="relative bg-surface-container-low pb-xl pt-lg md:pt-xl overflow-hidden [clip-path:polygon(0_0,100%_0,100%_90%,0_100%)]">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none bg-gradient-to-bl from-primary-container via-surface to-background blur-3xl" />
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 md:grid-cols-2 gap-xl items-center relative z-10">
          <div className="flex flex-col gap-lg order-2 md:order-1">
            <span className="font-label-bold text-label-bold text-primary uppercase tracking-widest">Achieve More</span>
            <h1 className="font-display-stat text-headline-lg md:text-display-stat text-on-surface">
              Your Ultimate <br className="hidden md:block" />
              <span className="bg-gradient-to-r from-primary-container to-primary bg-clip-text text-transparent">
                Performance Partner
              </span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md">
              Data-driven insights meets high-octane motivation. Track workouts, build routines, and hit new PRs with
              precision tracking built for athletes.
            </p>
            <div className="flex flex-col sm:flex-row gap-md pt-sm">
              <Link
                to="/signup"
                className="font-label-bold text-label-bold bg-primary-container text-on-primary px-xl py-md rounded-lg hover:bg-primary transition-all active:scale-95 elev-card text-center flex items-center justify-center gap-xs"
              >
                Start Tracking Now
                <Icon name="arrow_forward" size={18} />
              </Link>
              <a
                href="#features"
                className="font-label-bold text-label-bold border border-outline bg-surface text-on-surface px-xl py-md rounded-lg hover:bg-surface-variant transition-colors active:scale-95 text-center elev-card"
              >
                Explore Features
              </a>
            </div>
            <div className="flex items-center gap-lg pt-lg border-t border-outline-variant/50 mt-sm">
              <div>
                <p className="font-display-stat text-headline-lg text-on-surface">5M+</p>
                <p className="font-label-sm text-label-sm text-secondary uppercase">Workouts Logged</p>
              </div>
              <div className="w-px h-10 bg-outline-variant/50" />
              <div>
                <p className="font-display-stat text-headline-lg text-on-surface">99%</p>
                <p className="font-label-sm text-label-sm text-secondary uppercase">Tracking Accuracy</p>
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2 relative w-full aspect-square md:aspect-auto md:h-[520px]">
            <div className="absolute inset-0 bg-primary-container/5 rounded-xl md:rounded-[40px] rotate-3" />
            <Img
              src={heroImage}
              alt="Athlete mid-workout in a modern gym"
              icon="exercise"
              className="absolute inset-0 rounded-xl md:rounded-[32px] overflow-hidden"
              imgClassName="absolute inset-0 w-full h-full object-cover rounded-xl md:rounded-[32px] elev-overlay z-10"
            />
            <div className="absolute bottom-lg -left-xs md:left-[-40px] bg-surface rounded-xl p-md elev-overlay z-20 flex items-center gap-md border border-surface-variant">
              <div className="bg-primary-container/10 p-sm rounded-lg text-primary-container">
                <Icon name="local_fire_department" size={24} filled />
              </div>
              <div>
                <p className="font-label-sm text-label-sm text-secondary">Active Calories</p>
                <p className="font-headline-md text-headline-md text-on-surface">
                  1,240 <span className="font-label-sm text-label-sm text-secondary font-normal">kcal</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features */}
      <section id="features" className="py-xl max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop mt-xl scroll-mt-24">
        <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-lg">
          Everything in one place
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg">
          {features.map((feature) => (
            <Link
              key={feature.title}
              to={feature.to}
              className="bg-surface-container-lowest rounded-xl p-lg elev-card border border-surface-variant hover:border-primary/40 transition-colors group"
            >
              <div className="w-12 h-12 rounded-lg bg-primary-fixed text-primary flex items-center justify-center mb-md">
                <Icon name={feature.icon} size={24} />
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-xs group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="font-body-md text-body-md text-secondary text-sm">{feature.body}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending routines */}
      <section className="py-xl max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="flex justify-between items-end mb-lg">
          <div>
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
              Trending Routines
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
              Curated programs to accelerate your progress.
            </p>
          </div>
          <Link
            to="/routines"
            className="hidden md:flex font-label-bold text-label-bold text-primary items-center gap-xs hover:text-primary-container transition-colors"
          >
            View All <Icon name="arrow_forward" size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          {loading
            ? [1, 2, 3].map((n) => <SkeletonCard key={n} />)
            : routines.map((routine) => <RoutineCard key={routine.id} routine={routine} />)}
        </div>

        <div className="mt-lg md:hidden text-center">
          <Link
            to="/routines"
            className="font-label-bold text-label-bold border border-outline bg-surface text-on-surface px-xl py-sm rounded-lg hover:bg-surface-variant transition-colors active:scale-95 inline-block w-full"
          >
            View All Routines
          </Link>
        </div>
      </section>
    </div>
  )
}
