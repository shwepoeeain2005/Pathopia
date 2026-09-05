import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PrivateNavbar from '../../components/PrivateNavbar.jsx'
import Footer from '../../components/Footer.jsx'
import ResumeConflictModal from '../../components/ResumeConflictModal.jsx'
import CareerBriefingModal from '../../components/CareerBriefingModal.jsx'
import LoadingScreen from '../../components/LoadingScreen.jsx'
import { logout } from '../../lib/auth.js'
import { useScrollReveal, revealClass } from '../../hooks/useScrollReveal.js'
import backToTopIcon from '../../assets/landing/back-to-top-icon.png'
import './CareerSelection.css'

const SIMULATION_API_BASE = '/api/simulation'

const CAREERS = [
  {
    id: 'data-analyst',
    title: 'Data Analyst',
    tagline: 'Turn raw numbers into real decisions.',
    color: 'pink',
    image: 'Data_Analyst',
  },
  {
    id: 'project-manager',
    title: 'Project Manager',
    tagline: 'Keep the moving pieces on track.',
    color: 'blue',
    image: 'Project_Manager',
  },
  {
    id: 'software-engineer',
    title: 'Software Engineer',
    tagline: 'Build the systems people rely on.',
    color: 'green',
    image: 'Software_Engineer',
  },
  {
    id: 'ui-ux-designer',
    title: 'UI/UX Designer',
    tagline: 'Shape how people experience the product.',
    color: 'orange',
    image: 'Uiux_Designer',
  },
  {
    id: 'cyber-security-analyst',
    title: 'Cybersecurity Analyst',
    tagline: 'Find the weak spots before attackers do.',
    comingSoon: true,
  },
  {
    id: 'cloud-engineer',
    title: 'Cloud Engineer',
    tagline: 'Build infrastructure that scales without breaking.',
    comingSoon: true,
  },
  {
    id: 'qa-engineer',
    title: 'QA Engineer',
    tagline: 'Catch the bugs before your users do.',
    comingSoon: true,
  },
  {
    id: 'web-developer',
    title: 'Web Developer',
    tagline: 'Bring designs to life in the browser.',
    comingSoon: true,
  },
  {
    id: 'it-consultant',
    title: 'IT Consultant',
    tagline: 'Solve the tech problems clients can\'t.',
    comingSoon: true,
  },
  {
    id: 'network-engineer',
    title: 'Network Engineer',
    tagline: 'Keep the connections running, everywhere.',
    comingSoon: true,
  },
]

async function parseJsonOrNull(response) {
  const text = await response.text()
  return text ? JSON.parse(text) : null
}

async function readErrorMessage(response) {
  const text = await response.text()
  return text || `Request failed with status ${response.status}`
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20 L16.2 16.2" />
    </svg>
  )
}

function ClearIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path d="M6 6 L18 18 M18 6 L6 18" />
    </svg>
  )
}

// A plain wrapper so each grid cell fades/rises in on scroll independently
// of the career card's own hover transform/transition — putting the reveal
// animation on the card itself would fight that CSS for the `transform`
// and `transition` properties.
function RevealCard({ children }) {
  const [ref, isVisible] = useScrollReveal()
  return (
    <div ref={ref} className={revealClass(isVisible)}>
      {children}
    </div>
  )
}

function CareerSelection() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [conflict, setConflict] = useState(null)
  const [briefing, setBriefing] = useState(null)
  // Bounding rect of the clicked card's career image, so the briefing modal
  // can morph that same image from the grid into its own layout.
  const [briefingOrigin, setBriefingOrigin] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [starting, setStarting] = useState(false)
  // The unfinished-run check is fired when the briefing card opens and its
  // in-flight response parked here, so by the time the user reads the card
  // and hits Continue the result is usually already back.
  const unfinishedCheckRef = useRef(null)
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > window.innerHeight * 0.6)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const filteredCareers = CAREERS.filter((career) =>
    career.title.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  )

  // A missing/expired/invalid token reaches the backend as an anonymous
  // request, which Spring Security rejects with a bare 403 (no JSON body)
  // rather than surfacing "you need to log in" — so treat 401/403 here as
  // "session is stale" and send the user to log back in, instead of
  // showing a cryptic status-code banner.
  async function handleFailedResponse(response) {
    if (response.status === 401 || response.status === 403) {
      logout()
      navigate('/login', { state: { sessionExpired: true } })
      return
    }
    setErrorMessage(await readErrorMessage(response))
  }

  async function startCareer(careerId) {
    setStarting(true)
    const token = localStorage.getItem('authToken')

    const startResponse = await fetch(`${SIMULATION_API_BASE}/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ careerId }),
    })

    if (!startResponse.ok) {
      setStarting(false)
      await handleFailedResponse(startResponse)
      return
    }

    const startResult = await parseJsonOrNull(startResponse)
    navigate('/simulation', { state: { simulationState: startResult } })
  }

  // Kick off the (career-agnostic) unfinished-run check without awaiting it,
  // so it runs while the briefing card is on screen. `.catch` keeps a network
  // failure from becoming an unhandled rejection — Continue falls back to a
  // fresh request when the ref is empty.
  function prefetchUnfinishedCheck() {
    const token = localStorage.getItem('authToken')
    unfinishedCheckRef.current = fetch(`${SIMULATION_API_BASE}/check-unfinished`, {
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => null)
  }

  // Clicking a career opens the briefing card straight away; its career image
  // morphs from the grid. The conflict prompt only appears once the user
  // commits by hitting Continue, but the check behind it starts now.
  function handleCareerClick(career, cardEl) {
    setErrorMessage('')
    const imgEl = cardEl && cardEl.querySelector('.career-card__art-img')
    setBriefingOrigin(imgEl ? imgEl.getBoundingClientRect() : null)
    setBriefing(career)
    prefetchUnfinishedCheck()
  }

  async function handleBriefingContinue() {
    const career = briefing
    if (!career) return
    setBriefing(null)
    setErrorMessage('')
    const token = localStorage.getItem('authToken')

    try {
      // Global check: does the user have ANY unfinished run, for any career?
      // The modal always names that run's career, not the one just clicked.
      // Reuse the response the briefing-card open already started; only fire
      // a fresh request if that one is missing or errored.
      const checkResponse =
        (await unfinishedCheckRef.current) ||
        (await fetch(`${SIMULATION_API_BASE}/check-unfinished`, {
          headers: { Authorization: `Bearer ${token}` },
        }))
      unfinishedCheckRef.current = null

      if (!checkResponse.ok) {
        await handleFailedResponse(checkResponse)
        return
      }

      const unfinishedRun = await parseJsonOrNull(checkResponse)

      if (unfinishedRun) {
        // A short beat so the briefing card's close and the conflict card's
        // open read as one hand-off, not a jump-cut.
        await new Promise((resolve) => setTimeout(resolve, 250))
        setConflict({
          runId: unfinishedRun.runId,
          currentCareerId: unfinishedRun.careerId,
          currentCareerTitle: unfinishedRun.careerTitle,
          newCareerId: career.id,
          newCareerTitle: career.title,
        })
        return
      }

      await startCareer(career.id)
    } catch (err) {
      setErrorMessage(err.message || 'Something went wrong. Please try again.')
    }
  }

  async function handleResumeConflict() {
    setErrorMessage('')
    setStarting(true)
    const { runId } = conflict
    const token = localStorage.getItem('authToken')

    try {
      const resumeResponse = await fetch(`${SIMULATION_API_BASE}/${runId}/resume`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!resumeResponse.ok) {
        setStarting(false)
        await handleFailedResponse(resumeResponse)
        return
      }

      const resumeResult = await parseJsonOrNull(resumeResponse)
      setConflict(null)
      navigate('/simulation', { state: { simulationState: resumeResult } })
    } catch (err) {
      setStarting(false)
      setErrorMessage(err.message || 'Something went wrong. Please try again.')
    }
  }

  async function handleStartNewConflict() {
    setErrorMessage('')
    setStarting(true)
    const { runId, newCareerId } = conflict

    try {
      const token = localStorage.getItem('authToken')
      const deleteResponse = await fetch(`${SIMULATION_API_BASE}/${runId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!deleteResponse.ok) {
        setStarting(false)
        await handleFailedResponse(deleteResponse)
        return
      }

      setConflict(null)
      await startCareer(newCareerId)
    } catch (err) {
      setStarting(false)
      setErrorMessage(err.message || 'Something went wrong. Please try again.')
    }
  }

  return (
    <div className="career-selection night-sky-bg">
      <PrivateNavbar />

      <label className="career-selection__search">
        <SearchIcon />
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search careers..."
          aria-label="Search careers"
        />
        {searchQuery && (
          <button
            type="button"
            className="career-selection__search-clear"
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
          >
            <ClearIcon />
          </button>
        )}
      </label>

      <main className="career-selection__main">
        <h1 className="career-selection__heading">Choose Your Path</h1>
        <p className="career-selection__subheading">
          Pick a career to step into its simulation.
        </p>

        {errorMessage && (
          <div className="career-selection__error" role="alert">
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage('')}
              aria-label="Dismiss"
              className="career-selection__error-dismiss"
            >
              <ClearIcon />
            </button>
          </div>
        )}

        {filteredCareers.length === 0 ? (
          <p className="career-selection__no-results">
            No careers match &ldquo;{searchQuery}&rdquo;.
          </p>
        ) : (
          <div className="career-selection__grid">
            {filteredCareers.map((career) => {
              if (career.comingSoon) {
                return (
                  <RevealCard key={career.id}>
                    <button
                      type="button"
                      className="career-card career-card--disabled"
                      disabled
                      aria-disabled="true"
                    >
                      <span className="career-card__badge">Coming Soon</span>
                      <h2 className="career-card__title">{career.title}</h2>
                    </button>
                  </RevealCard>
                )
              }

              return (
                <RevealCard key={career.id}>
                  <div
                    className="career-card career-card--available"
                    data-color={career.color}
                    role="button"
                    tabIndex={0}
                    onClick={(event) => handleCareerClick(career, event.currentTarget)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        handleCareerClick(career, event.currentTarget)
                      }
                    }}
                  >
                    <div className="career-card__art">
                      <img
                        className="career-card__art-img"
                        src={`/${career.image}_after_hover.png`}
                        alt=""
                        aria-hidden="true"
                      />
                    </div>
                    <h2 className="career-card__title">{career.title}</h2>
                    <p className="career-card__tagline">{career.tagline}</p>
                    <span className="career-card__start">Start</span>
                  </div>
                </RevealCard>
              )
            })}
          </div>
        )}
      </main>

      <Footer />

      {conflict && (
        <ResumeConflictModal
          currentCareerName={conflict.currentCareerTitle}
          newCareerName={conflict.newCareerTitle}
          isSameCareer={conflict.currentCareerId === conflict.newCareerId}
          onResume={handleResumeConflict}
          onStartNew={handleStartNewConflict}
          onCancel={() => setConflict(null)}
        />
      )}

      {briefing && (
        <CareerBriefingModal
          career={briefing}
          originRect={briefingOrigin}
          onContinue={handleBriefingContinue}
          onClose={() => setBriefing(null)}
        />
      )}

      {starting && <LoadingScreen />}

      <button
        type="button"
        className={`career-selection__back-to-top${showBackToTop ? ' career-selection__back-to-top--visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Back to top"
      >
        <img src={backToTopIcon} alt="" />
      </button>
    </div>
  )
}

export default CareerSelection
