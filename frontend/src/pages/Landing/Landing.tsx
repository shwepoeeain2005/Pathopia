import { useEffect, useState } from 'react'
import heroBackground from '../../assets/landing/hero-background.png'
import backToTopIcon from '../../assets/landing/back-to-top-icon.png'
import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import './Landing.css'

const SLOGAN = 'Not a test. Not a game. A glimpse.'

const FEATURES = [
  {
    title: 'Interactive Career Simulation',
    description:
      'Step into realistic workplace scenarios and make the calls that shape your path.',
  },
  {
    title: 'AI Reflection',
    description:
      'Get a thoughtful, personalized look at what your choices reveal about you.',
  },
  {
    title: 'Personalized Skill Analysis',
    description:
      'See your tendencies take shape across the traits that matter most.',
  },
  {
    title: 'Career History',
    description:
      "Revisit every path you've explored and how far you've come.",
  },
]

const STEPS = [
  {
    number: '01',
    title: 'Choose Your Path',
    description:
      'Pick a career track that intrigues you — Data Analyst, Project Manager, Software Engineer, or UI/UX Designer.',
  },
  {
    number: '02',
    title: 'Live the Moments',
    description:
      'Navigate real workplace scenarios and make choices that shape your journey.',
  },
  {
    number: '03',
    title: 'Reflect & Discover',
    description:
      'Receive a personalized reflection on how your choices reveal your strengths.',
  },
]

function CompassIcon() {
  return (
    <svg
      className="landing-step-card__icon"
      viewBox="0 0 40 40"
      width="22"
      height="22"
      aria-hidden="true"
    >
      <circle cx="20" cy="20" r="17" />
      <path d="M20 7 L23 20 L20 33 L17 20 Z" />
    </svg>
  )
}

function DialogueIcon() {
  return (
    <svg
      className="landing-step-card__icon"
      viewBox="0 0 40 40"
      width="22"
      height="22"
      aria-hidden="true"
    >
      <circle cx="20" cy="20" r="17" />
      <path d="M10 12 H30 A2 2 0 0 1 32 14 V24 A2 2 0 0 1 30 26 H18 L12 31 V26 H10 A2 2 0 0 1 8 24 V14 A2 2 0 0 1 10 12 Z" />
    </svg>
  )
}

function StarBurstIcon() {
  return (
    <svg
      className="landing-step-card__icon"
      viewBox="0 0 40 40"
      width="22"
      height="22"
      aria-hidden="true"
    >
      <circle cx="20" cy="20" r="17" />
      <path d="M20 5 L22.5 15.5 L33 13 L25.5 20 L33 27 L22.5 24.5 L20 35 L17.5 24.5 L7 27 L14.5 20 L7 13 L17.5 15.5 Z" />
    </svg>
  )
}

const STEP_ICONS = [CompassIcon, DialogueIcon, StarBurstIcon]

function ScenarioIcon() {
  return (
    <svg
      className="landing-feature-card__icon"
      viewBox="0 0 24 24"
      width="26"
      height="26"
      aria-hidden="true"
    >
      <path d="M7 4 L20 12 L7 20 Z" />
    </svg>
  )
}

function ReflectionIcon() {
  return (
    <svg
      className="landing-feature-card__icon"
      viewBox="0 0 24 24"
      width="26"
      height="26"
      aria-hidden="true"
    >
      <path d="M4 5 H20 A2 2 0 0 1 22 7 V15 A2 2 0 0 1 20 17 H11 L6 21 V17 H4 A2 2 0 0 1 2 15 V7 A2 2 0 0 1 4 5 Z" />
    </svg>
  )
}

function SkillIcon() {
  return (
    <svg
      className="landing-feature-card__icon"
      viewBox="0 0 24 24"
      width="26"
      height="26"
      aria-hidden="true"
    >
      <rect x="3" y="13" width="4" height="8" />
      <rect x="10" y="8" width="4" height="13" />
      <rect x="17" y="3" width="4" height="18" />
    </svg>
  )
}

function HistoryIcon() {
  return (
    <svg
      className="landing-feature-card__icon"
      viewBox="0 0 24 24"
      width="26"
      height="26"
      aria-hidden="true"
    >
      <path d="M6 2 H18 V22 L12 18 L6 22 Z" />
    </svg>
  )
}

const FEATURE_ICONS = [ScenarioIcon, ReflectionIcon, SkillIcon, HistoryIcon]

function Landing() {
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > window.innerHeight * 0.8)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="landing">
      <Navbar />

      <header
        className="landing-hero"
        style={{ backgroundImage: `url(${heroBackground})` }}
      >
        <div className="landing-hero__content">
          <h1 className="landing-hero__tagline">
            Experience Your Future Before You Choose.
          </h1>
          <p className="landing-hero__slogan">{SLOGAN}</p>
          <div className="landing-hero__actions">
            <a href="/login" className="landing-button">
              Sign in &amp; Explore
            </a>
            <a href="/register" className="landing-button">
              Start your journey
            </a>
          </div>
        </div>
        <span className="landing-hero__scroll-indicator" aria-hidden="true">
          &#8964;
        </span>
      </header>

      <main>
        <section className="landing-section landing-section--periwinkle landing-what">
          <div className="landing-section__heading">
            <h2>What is Pathopia?</h2>
          </div>
          <div className="landing-box landing-box--violet">
            <p className="landing-box__text">
              Instead of simply telling you about careers, Pathopia lets you
              experience realistic career situations and discover whether a
              profession truly fits your strengths.
            </p>
          </div>
        </section>

        <section className="landing-section landing-section--peach landing-how">
          <div className="landing-section__heading">
            <h2>How Pathopia Works</h2>
            <p>From curiosity to career clarity — in three simple steps.</p>
          </div>
          <div className="landing-how__grid">
            {STEPS.map((step, index) => {
              const Icon = STEP_ICONS[index]
              return (
                <article key={step.number} className="landing-step-card">
                  <div className="landing-step-card__top">
                    <span className="landing-step-card__badge">
                      <Icon />
                    </span>
                    <span
                      className="landing-step-card__number"
                      aria-hidden="true"
                    >
                      {step.number}
                    </span>
                  </div>
                  <h3 className="landing-step-card__title">{step.title}</h3>
                  <p className="landing-step-card__text">
                    {step.description}
                  </p>
                </article>
              )
            })}
          </div>
        </section>

        <section className="landing-section landing-section--periwinkle">
          <div className="landing-section__heading">
            <h2>Our Features</h2>
          </div>
          <div className="landing-features-grid">
            {FEATURES.map((feature, index) => {
              const Icon = FEATURE_ICONS[index]
              return (
                <article key={feature.title} className="landing-feature-card">
                  <div className="landing-feature-card__glow">
                    <Icon />
                  </div>
                  <h3 className="landing-feature-card__title">
                    {feature.title}
                  </h3>
                  <p className="landing-feature-card__text">
                    {feature.description}
                  </p>
                </article>
              )
            })}
          </div>
        </section>

        <section className="landing-section landing-section--peach">
          <div className="landing-section__heading">
            <h2>About Project</h2>
          </div>
          <div className="landing-box landing-box--violet">
            <p className="landing-box__text">
              Pathopia is a student-built project exploring how simulation
              can make career discovery feel human, honest, and a little
              wondrous.
            </p>
            <a href="/about" className="landing-box__link">
              Meet Our Team
            </a>
          </div>
        </section>
      </main>

      <Footer />

      <button
        type="button"
        className={`landing-back-to-top${showBackToTop ? ' landing-back-to-top--visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Back to top"
      >
        <img src={backToTopIcon} alt="" />
      </button>
    </div>
  )
}

export default Landing