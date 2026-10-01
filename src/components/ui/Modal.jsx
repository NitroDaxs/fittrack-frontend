import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import Icon from './Icon'

export default function Modal({ open, title, description, onClose, children, footer, size = 'md' }) {
  const panelRef = useRef(null)

  // Kept in a ref so the effect below doesn't need `onClose` as a dependency.
  // Callers pass an inline arrow (`onClose={() => setEditing(null)}`), which is a
  // new function every render -- listing it as a dep re-ran the effect on every
  // keystroke, and the autofocus line yanked the caret back to the first field
  // after each character typed.
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onCloseRef.current?.()
    }
    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // Runs once per open, not once per render.
    panelRef.current?.querySelector('input, select, textarea, button')?.focus()
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  if (!open) return null

  const width = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' }[size]

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
      {/* 20% backdrop dim, per the elevation spec */}
      <div className="absolute inset-0 bg-on-surface/20 backdrop-blur-[2px]" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative z-10 w-full ${width} bg-surface-container-lowest rounded-t-xl md:rounded-xl elev-overlay border border-surface-variant max-h-[92vh] flex flex-col`}
      >
        <header className="flex items-start justify-between gap-md p-lg border-b border-surface-variant">
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface">{title}</h2>
            {description ? (
              <p className="font-body-md text-body-md text-secondary mt-xs">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-secondary hover:text-on-surface hover:bg-surface-container rounded-full p-xs transition-colors shrink-0"
          >
            <Icon name="close" size={20} />
          </button>
        </header>

        <div className="p-lg overflow-y-auto custom-scrollbar flex-1">{children}</div>

        {footer ? (
          <footer className="p-lg border-t border-surface-variant flex justify-end gap-sm bg-surface-container-low rounded-b-xl">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>,
    document.body
  )
}
