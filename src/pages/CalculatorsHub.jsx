import { Link } from 'react-router-dom'
import { calculators } from '../data/calculators'
import Icon from '../components/ui/Icon'

export default function CalculatorsHub() {
  return (
    <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-xl">
      <header className="mb-xl">
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-sm">
          Fitness Calculators
        </h1>
        <p className="font-body-md text-body-md text-secondary max-w-2xl">
          Science-backed tools to optimize your training and nutrition.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg">
        {calculators.map((calculator) => (
          <Link
            key={calculator.slug}
            to={`/calculators/${calculator.slug}`}
            className="bg-surface-container-lowest rounded-xl p-lg elev-card border border-surface-variant hover:border-primary/40 transition-colors group"
          >
            <div className="w-12 h-12 rounded-lg bg-primary-fixed text-primary flex items-center justify-center mb-md">
              <Icon name={calculator.icon} size={24} />
            </div>
            <h2 className="font-headline-md text-headline-md text-on-surface mb-xs flex items-center gap-xs">
              {calculator.name}
              <Icon
                name="arrow_forward"
                size={18}
                className="text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
              />
            </h2>
            <p className="font-body-md text-body-md text-secondary text-sm">{calculator.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
