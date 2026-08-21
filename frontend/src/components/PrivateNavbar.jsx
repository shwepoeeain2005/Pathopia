import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logoFull from '../assets/landing/logo-full.png'
import { logout } from '../lib/auth'
import ProfileModal from './ProfileModal'
import SettingsModal from './SettingsModal'
import './PrivateNavbar.css'

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M4 11 L12 4 L20 11" />
      <path d="M6 10 V20 H18 V10" />
      <path d="M10 20 V14 H14 V20" />
    </svg>
  )
}

function HistoryIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M3 12a9 9 0 1 0 2.6-6.3" />
      <path d="M3 4v4.5h4.5" />
      <path d="M12 8v4l3 2" />
    </svg>
  )
}

function CompassStarIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6 L14 12 L12 18 L10 12 Z" />
      <path d="M6 12 L12 10 L18 12 L12 14 Z" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="11" x2="12" y2="16" />
      <circle cx="12" cy="7.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

const NAV_LINKS = [
  { label: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { label: 'Career Selection', href: '/career-selection', icon: CompassStarIcon },
  { label: 'History', href: '#', icon: HistoryIcon },
  { label: 'About', href: '/about', icon: InfoIcon },
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

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" />
      <path d="M16 16l4-4-4-4" />
      <path d="M20 12H9" />
    </svg>
  )
}

function PrivateNavbar() {
  const navigate = useNavigate()
  const [activeModal, setActiveModal] = useState(null)
  const userName = localStorage.getItem('fullName') || 'Your Profile'

  const closeModal = () => setActiveModal(null)
  const toggleModal = (name) => setActiveModal((current) => (current === name ? null : name))

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <>
      <button
        type="button"
        onClick={() => toggleModal('profile')}
        className="private-nav__profile private-nav__profile--floating"
      >
        <span className="private-nav__avatar">
          <ProfileIcon />
        </span>
        <span className="private-nav__profile-name">{userName}</span>
      </button>

      <nav className="private-nav">
        <img src={logoFull} alt="Pathopia" className="private-nav__logo" />

        <div className="private-nav__links">
          {NAV_LINKS.map((link) => (
            <a key={link.label} href={link.href} className="private-nav__item">
              <span className="private-nav__item-icon">
                <link.icon />
              </span>
              <span className="private-nav__item-label">{link.label}</span>
            </a>
          ))}
        </div>

        <div className="private-nav__actions">
          <button
            type="button"
            onClick={() => toggleModal('settings')}
            className="private-nav__item private-nav__item--button"
          >
            <span className="private-nav__item-icon">
              <SettingsIcon />
            </span>
            <span className="private-nav__item-label">Settings</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="private-nav__item private-nav__item--button"
          >
            <span className="private-nav__item-icon">
              <LogoutIcon />
            </span>
            <span className="private-nav__item-label">Logout</span>
          </button>
        </div>
      </nav>

      {activeModal === 'profile' && <ProfileModal onClose={closeModal} />}
      {activeModal === 'settings' && <SettingsModal onClose={closeModal} />}
    </>
  )
}

export default PrivateNavbar
