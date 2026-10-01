import { Link, useLocation } from 'react-router-dom'
import Icon from '../components/ui/Icon'

const content = {
  '/about': {
    title: 'About FitTrack',
    body: 'FitTrack is a training log built around the idea that progress comes from consistency and honest numbers, not novelty. This prototype demonstrates the interface; the content here is placeholder copy.',
  },
  '/contact': {
    title: 'Contact',
    body: 'A real contact form will post to the API. For now this page exists so the footer links resolve to something rather than dead-ending.',
  },
  '/legal': {
    title: 'Legal',
    body: 'Terms of service placeholder. Nothing on this prototype constitutes a binding agreement.',
  },
  '/privacy': {
    title: 'Privacy Policy',
    body: 'This prototype stores no personal data. The only thing written to your browser is a demo session flag in localStorage, which you can clear by logging out.',
  },
}

export default function StaticPage() {
  const { pathname } = useLocation()
  const page = content[pathname] ?? { title: 'Page', body: 'Placeholder content.' }

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
