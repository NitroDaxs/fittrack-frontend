import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import Icon from '../components/ui/Icon'

const content: Record<string, { title: string; body: string }> = {
  '/about': {
    title: 'staticPage.aboutFittrack',
    body: 'staticPage.fittrackIsATrainingLogBuilt',
  },
  '/contact': {
    title: 'common.contact',
    body: 'staticPage.contactDetailsHaveNotBeenPublished',
  },
  '/legal': {
    title: 'common.legal',
    body: 'staticPage.termsOfServiceHaveNotBeen',
  },
  '/privacy': {
    title: 'common.privacyPolicy',
    body: 'staticPage.aFullPrivacyPolicyHasNot',
  },
}

export default function StaticPage() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const page = content[pathname] ?? { title: 'FitTrack', body: '' }

  return (
    <div className="max-w-[720px] mx-auto px-margin-mobile md:px-margin-desktop py-xl">
      <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-md">
        {t(page.title)}
      </h1>
      <p className="font-body-lg text-body-lg text-on-surface-variant mb-xl">{page.body ? t(page.body) : ''}</p>
      <Link
        to="/"
        className="inline-flex items-center gap-xs font-label-bold text-label-bold text-primary hover:text-primary-container transition-colors"
      >
        <Icon name="arrow-left" size={20} />
        {t('common.backToHome')}
      </Link>
    </div>
  )
}
