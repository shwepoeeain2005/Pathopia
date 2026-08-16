import logoFull from '../assets/landing/logo-full.png'

function PublicNavbar() {
  return (
    <nav className="landing-nav">
      <img src={logoFull} alt="Pathopia" className="landing-nav__logo" />
      <div className="landing-nav__links">
        <a href="/login" className="landing-nav__link">
          Login
        </a>
        <a href="/register" className="landing-nav__link">
          Register
        </a>
      </div>
    </nav>
  )
}

export default Navbar
