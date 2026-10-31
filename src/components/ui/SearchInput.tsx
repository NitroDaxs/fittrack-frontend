import type { InputHTMLAttributes } from 'react'
import Icon from './Icon'

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: string
  onChange: (value: string) => void
}

export default function SearchInput({ value, onChange, placeholder = 'Search...', className = '', ...rest }: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <Icon
        name="search"
        size={20}
        className="absolute left-sm top-1/2 -translate-y-1/2 text-secondary pointer-events-none"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full bg-surface-container-low border-none rounded-lg pl-xl pr-md py-sm focus:ring-2 focus:ring-primary focus:bg-surface transition-all text-on-background font-body-md shadow-sm outline-none"
        {...rest}
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-sm top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface"
        >
          <Icon name="x" size={18} />
        </button>
      ) : null}
    </div>
  )
}
