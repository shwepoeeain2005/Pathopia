import Navbar from '../../components/PublicNavbar.jsx'
import Footer from '../../components/Footer.jsx'
import '../Landing/Landing.css'

function About() {
  return (
    <div className="landing">
      <Navbar />

      <main>
        <section
          className="landing-section landing-section--periwinkle"
          style={{ paddingTop: 160 }}
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
