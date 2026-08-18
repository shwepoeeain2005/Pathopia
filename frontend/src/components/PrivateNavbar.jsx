import logoFull from '../assets/landing/logo-full.png'
import './PrivateNavbar.css'

const NAV_LINKS = [
  { label: 'Dashboard', href: '#' },
  { label: 'Career Selection', href: '/career-selection' },
  { label: 'History', href: '#' },
  { label: 'About', href: '#' },
]

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2.2M12 18.8V21M21 12h-2.2M5.2 12H3M18.4 5.6l-1.55 1.55M7.15 16.85l-1.55 1.55M18.4 18.4l-1.55-1.55M7.15 7.15L5.6 5.6" />
    </svg>
  )
}

function PrivateNavbar() {
  return (
    <nav className="private-nav">
      <img src={logoFull} alt="Pathopia" className="private-nav__logo" />

      <div className="private-nav__links">
        {NAV_LINKS.map((link) => (
          <a key={link.label} href={link.href} className="private-nav__link">
            {link.label}
          </a>
        ))}
      </div>

      <div className="private-nav__actions">
        <a
          href="#"
          className="private-nav__icon-button"
          aria-label="Profile"
        >
          <ProfileIcon />
        </a>
        <a
          href="#"
          className="private-nav__icon-button"
          aria-label="Settings"
        >
          <SettingsIcon />
        </a>
      </div>
    </nav>
  )
}

export default PrivateNavbar
