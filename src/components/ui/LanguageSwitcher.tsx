import { useCallback, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDismiss } from '../../hooks/useDismiss'
import { LANGUAGES } from '../../i18n'
import Icon from './Icon'

/** Language dropdown. The choice is remembered in this browser. */
export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const panelId = useId()
  const close = useCallback(() => setOpen(false), [])
  useDismiss(open, close, root, button)

  const current = LANGUAGES.find((language) => language.code === i18n.resolvedLanguage) ?? LANGUAGES[0]

  return (
    <div ref={root} className="relative shrink-0">
      <button
        ref={button}
        type="button"
        aria-label={`${t('common.language')}: ${current.name}`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-xs rounded-lg px-sm py-sm font-label-bold text-label-bold text-secondary transition-colors hover:bg-surface-container hover:text-primary"
      >
        <Icon name="globe" size={18} />
        <span lang={current.code}>{current.label}</span>
        <Icon name="chevron-down" size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open ? (
        <div
          id={panelId}
          className="absolute right-0 top-full z-50 mt-xs flex w-40 flex-col gap-xs rounded-lg border border-surface-variant bg-surface-container-lowest p-xs elev-overlay"
        >
          {LANGUAGES.map((language) => {
            const selected = language.code === current.code
            return (
              <button
                key={language.code}
                type="button"
                lang={language.code}
                aria-pressed={selected}
                onClick={() => {
                  void i18n.changeLanguage(language.code)
                  close()
                  button.current?.focus()
                }}
                className={`flex items-center justify-between rounded-lg px-sm py-sm text-left font-label-bold text-label-bold transition-colors hover:bg-surface-container ${
                  selected ? 'text-primary' : 'text-on-surface'
                }`}
              >
                {language.name}
                {selected ? <Icon name="check" size={16} /> : null}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
