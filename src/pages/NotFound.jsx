import { Link } from 'react-router-dom'
import Icon from '../components/ui/Icon'

export default function NotFound() {
  return (
    <div className="max-w-[720px] mx-auto px-margin-mobile py-xl text-center">
      <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-outline mx-auto mb-md">
        <Icon name="explore_off" size={32} />
      </div>
      <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-sm">Page not found</h1>
      <p className="font-body-md text-body-md text-secondary mb-lg">
        That route does not exist in this prototype.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-xs font-label-bold text-label-bold bg-primary-container text-on-primary px-lg py-sm rounded-lg hover:bg-primary transition-colors"
      >
        <Icon name="home" size={20} />
        Back to home
      </Link>
    </div>
  )
}
