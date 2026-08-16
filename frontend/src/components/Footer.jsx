import logoFull from '../assets/landing/logo-full.png'

const SLOGAN = 'Not a test. Not a game. A glimpse.'

const SOCIALS = [
  {
    label: 'Instagram',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <circle cx="6" cy="7" r="2" />
        <circle cx="18" cy="7" r="2" />
        <circle cx="12" cy="17" r="2" />
        <path d="M6 9 L12 15 M18 9 L12 15" />
      </svg>
    ),
  },
  {
    label: 'X',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path d="M5 5 L19 19 M19 5 L5 19" />
      </svg>
    ),
  },
]

function Footer() {
  return (
    <footer className="landing-footer">
      <div className="landing-footer__grid">
        <div className="landing-footer__col landing-footer__brand">
          <img
            src={logoFull}
            alt="Pathopia"
            className="landing-footer__logo"
          />
          <p className="landing-footer__slogan">{SLOGAN}</p>
        </div>

        <div className="landing-footer__col">
          <h4 className="landing-footer__heading">Quick Links</h4>
          <a href="/about" className="landing-footer__link">
            About
          </a>
          <a href="/login" className="landing-footer__link">
            Login
          </a>
          <a href="/register" className="landing-footer__link">
            Register
          </a>
        </div>

        <div className="landing-footer__col">
          <h4 className="landing-footer__heading">Follow</h4>
          <div className="landing-footer__socials">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                href="#"
                className="landing-footer__social"
                aria-label={social.label}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        <div className="landing-footer__col">
          <h4 className="landing-footer__heading">Contact</h4>
          <p className="landing-footer__text">hello@pathopia.app</p>
          <p className="landing-footer__text">Yangon, Myanmar</p>
        </div>
      </div>

      <div className="landing-footer__divider" />
      <p className="landing-footer__copyright">
        © 2026 Pathopia. A student project.
      </p>
    </footer>
  )
}

export default Footer
