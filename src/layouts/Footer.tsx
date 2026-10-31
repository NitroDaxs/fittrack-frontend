import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

const links = [
  { to: '/about', label: 'nav.aboutUs' },
  { to: '/contact', label: 'common.contact' },
  { to: '/legal', label: 'common.legal' },
  { to: '/privacy', label: 'common.privacyPolicy' },
]

export default function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="w-full py-xl bg-surface-container border-t border-outline-variant mt-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-lg px-margin-mobile md:px-margin-desktop max-w-[1280px] mx-auto">
        <div>
          <span className="font-headline-md text-headline-md text-primary block mb-sm">FitTrack</span>
          <p className="font-body-md text-body-md text-on-surface-variant text-sm">
            {t('nav.dataDrivenVitalityForHighPerformance')}
          </p>
        </div>
        <div className="md:col-span-3 flex flex-wrap gap-lg md:justify-end items-start">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="font-body-md text-body-md text-on-secondary-container hover:text-primary underline transition-all duration-200"
            >
              {t(link.label)}
            </Link>
          ))}
        </div>
        <div className="md:col-span-4 mt-lg pt-lg border-t border-outline-variant/50 text-center md:text-left">
          <p className="font-body-md text-body-md text-on-surface-variant text-sm">
            {t('nav.x2024FittrackAllRightsReserved')}
          </p>
        </div>
      </div>
    </footer>
  )
}
