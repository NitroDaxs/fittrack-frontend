import { Link } from 'react-router-dom'

const links = [
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact' },
  { to: '/legal', label: 'Legal' },
  { to: '/privacy', label: 'Privacy Policy' },
]

export default function Footer() {
  return (
    <footer className="w-full py-xl bg-surface-container border-t border-outline-variant mt-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-lg px-margin-mobile md:px-margin-desktop max-w-[1280px] mx-auto">
        <div>
          <span className="font-headline-md text-headline-md text-primary block mb-sm">FitTrack</span>
          <p className="font-body-md text-body-md text-on-surface-variant text-sm">
            Data-driven vitality for high-performance fitness.
          </p>
        </div>
        <div className="md:col-span-3 flex flex-wrap gap-lg md:justify-end items-start">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="font-body-md text-body-md text-on-secondary-container hover:text-primary underline transition-all duration-200"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="md:col-span-4 mt-lg pt-lg border-t border-outline-variant/50 text-center md:text-left">
          <p className="font-body-md text-body-md text-on-surface-variant text-sm">
            © 2024 FitTrack. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
