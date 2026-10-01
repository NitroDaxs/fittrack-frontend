import Icon from './Icon'

export function Spinner({ label = 'Loading' }) {
  return (
    <div className="flex items-center justify-center gap-sm py-xl text-secondary" role="status">
      <span className="w-5 h-5 rounded-full border-2 border-surface-variant border-t-primary-container animate-spin" />
      <span className="font-label-sm text-label-sm">{label}</span>
    </div>
  )
}

export function EmptyState({ icon = 'search_off', title, body, action }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center text-center py-xl px-md">
      <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-outline mb-md">
        <Icon name={icon} size={32} />
      </div>
      <h3 className="font-headline-md text-headline-md text-on-surface mb-xs">{title}</h3>
      {body ? <p className="font-body-md text-body-md text-secondary max-w-md">{body}</p> : null}
      {action ? <div className="mt-md">{action}</div> : null}
    </div>
  )
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center text-center py-xl px-md">
      <div className="w-16 h-16 rounded-full bg-error-container flex items-center justify-center text-on-error-container mb-md">
        <Icon name="error" size={32} />
      </div>
      <h3 className="font-headline-md text-headline-md text-on-surface mb-xs">Something went wrong</h3>
      <p className="font-body-md text-body-md text-secondary max-w-md">
        {error?.message ?? 'The request could not be completed.'}
      </p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-md font-label-bold text-label-bold bg-primary text-on-primary px-lg py-sm rounded-lg hover:bg-surface-tint transition-colors"
        >
          Try again
        </button>
      ) : null}
    </div>
  )
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-surface-container-lowest rounded-xl border border-surface-variant overflow-hidden ${className}`}>
      <div className="h-48 bg-surface-container animate-pulse" />
      <div className="p-md space-y-sm">
        <div className="h-5 w-2/3 bg-surface-container rounded animate-pulse" />
        <div className="h-4 w-full bg-surface-container rounded animate-pulse" />
        <div className="h-4 w-4/5 bg-surface-container rounded animate-pulse" />
      </div>
    </div>
  )
}
