import PublicNavbar from '../../components/PublicNavbar.jsx'
import PrivateNavbar from '../../components/PrivateNavbar.jsx'
import Footer from '../../components/Footer.jsx'
import '../Landing/Landing.css'

function About() {
  const isLoggedIn = Boolean(localStorage.getItem('authToken'))

  return (
    <div
      className={
        isLoggedIn
          ? 'landing landing--about landing--private-nav night-sky-bg'
          : 'landing landing--about night-sky-bg'
      }
    >
      {isLoggedIn ? <PrivateNavbar /> : <PublicNavbar />}

      <main>
        <section
          className="landing-section landing-section--periwinkle"
          style={{ paddingTop: isLoggedIn ? 150 : 160 }}
        >
          <div className="landing-section__heading">
            <h2>About Pathopia</h2>
          </div>
          <div className="landing-box landing-box--violet">
            <p className="landing-box__text">
              Pathopia is a student-built project exploring how simulation
              can make career discovery feel human, honest, and a little
              wondrous. We're still building — more about our team and story
              is coming soon.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default About
