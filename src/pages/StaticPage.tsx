import { Link, useLocation } from 'react-router-dom'
import Icon from '../components/ui/Icon'

const content: Record<string, { title: string; body: string }> = {
  '/about': {
    title: 'About FitTrack',
    body: 'FitTrack is a training log built around the idea that progress comes from consistency and honest numbers, not novelty.',
  },
  '/contact': {
    title: 'Contact',
    body: 'Contact details have not been published yet.',
  },
  '/legal': {
    title: 'Legal',
    body: 'Terms of service have not been published yet.',
  },
  '/privacy': {
    title: 'Privacy Policy',
    body: 'A full privacy policy has not been published yet. FitTrack stores the account details, workouts and body measurements you enter, and keeps your sign-in token in your browser until you log out.',
  },
}

export default function StaticPage() {
  const { pathname } = useLocation()
  const page = content[pathname] ?? { title: 'FitTrack', body: '' }

  return (
    <div className="max-w-[720px] mx-auto px-margin-mobile md:px-margin-desktop py-xl">
      <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-md">
        {page.title}
      </h1>
      <p className="font-body-lg text-body-lg text-on-surface-variant mb-xl">{page.body}</p>
      <Link
        to="/"
        className="inline-flex items-center gap-xs font-label-bold text-label-bold text-primary hover:text-primary-container transition-colors"
      >
        <Icon name="arrow_back" size={20} />
        Back to home
      </Link>
    </div>
  )
}
