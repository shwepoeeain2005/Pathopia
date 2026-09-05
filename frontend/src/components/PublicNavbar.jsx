import { Link } from 'react-router-dom'
import logoFull from '../assets/landing/logo-full.png'

function PublicNavbar() {
  return (
    <nav className="landing-nav">
      <img src={logoFull} alt="Pathopia" className="landing-nav__logo" />
      <div className="landing-nav__links">
        {/* Link (client-side route change), not a plain <a> — a full page
            reload here would wipe the audio engine's state and force the
            background music to re-block on autoplay and restart from 0. */}
        <Link to="/login" className="landing-nav__link">
          Login
        </Link>
        <Link to="/register" className="landing-nav__link">
          Register
        </Link>
      </div>
    </nav>
  )
}

export default PublicNavbar
