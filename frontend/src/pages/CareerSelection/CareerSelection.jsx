import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart2, ClipboardCheck, Code2, PenTool } from 'lucide-react'
import PrivateNavbar from '../../components/PrivateNavbar.jsx'
import Footer from '../../components/Footer.jsx'
import ResumeConflictModal from '../../components/ResumeConflictModal.jsx'
import LoadingScreen from '../../components/LoadingScreen.jsx'
import { logout } from '../../lib/auth.js'
import './CareerSelection.css'

const SIMULATION_API_BASE = '/api/simulation'

const CAREERS = [
  {
    id: 'data-analyst',
    title: 'Data Analyst',
    tagline: 'Turn raw numbers into real decisions.',
    color: 'pink',
    icon: BarChart2,
  },
  {
    id: 'project-manager',
    title: 'Project Manager',
    tagline: 'Keep the moving pieces on track.',
    color: 'blue',
    icon: ClipboardCheck,
  },
  {
    id: 'software-engineer',
    title: 'Software Engineer',
    tagline: 'Build the systems people rely on.',
    color: 'green',
    icon: Code2,
  },
  {
    id: 'ui-ux-designer',
    title: 'UI/UX Designer',
    tagline: 'Shape how people experience the product.',
    color: 'orange',
    icon: PenTool,
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

function CareerSelection() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [conflict, setConflict] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [starting, setStarting] = useState(false)

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

  async function handleCareerClick(career) {
    setErrorMessage('')
    const token = localStorage.getItem('authToken')

    try {
      const checkResponse = await fetch(
        `${SIMULATION_API_BASE}/check-unfinished/${career.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      if (!checkResponse.ok) {
        await handleFailedResponse(checkResponse)
        return
      }

      const unfinishedRun = await parseJsonOrNull(checkResponse)

      if (unfinishedRun) {
        setConflict({
          runId: unfinishedRun.runId,
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
    <div className="career-selection">
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
                  <button
                    key={career.id}
                    type="button"
                    className="career-card career-card--disabled"
                    disabled
                    aria-disabled="true"
                  >
                    <span className="career-card__badge">Coming Soon</span>
                    <h2 className="career-card__title">{career.title}</h2>
                  </button>
                )
              }

              const Icon = career.icon

              return (
                <div
                  key={career.id}
                  className="career-card career-card--available"
                  data-color={career.color}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleCareerClick(career)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      handleCareerClick(career)
                    }
                  }}
                >
                  <div className="career-card__icon">
                    <Icon size={22} strokeWidth={2.25} />
                  </div>
                  <div className="career-card__heading">
                    <span className="career-card__dot" />
                    <h2 className="career-card__title">{career.title}</h2>
                  </div>
                  <p className="career-card__tagline">{career.tagline}</p>
                  <span className="career-card__start">Start</span>
                </div>
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
          onResume={handleResumeConflict}
          onStartNew={handleStartNewConflict}
          onCancel={() => setConflict(null)}
        />
      )}

      {starting && <LoadingScreen />}
    </div>
  )
}

export default CareerSelection
