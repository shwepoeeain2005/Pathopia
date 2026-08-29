import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PrivateNavbar from '../../components/PrivateNavbar.jsx'
import Footer from '../../components/Footer.jsx'
import { logout } from '../../lib/auth.js'

const SIMULATION_API_BASE = '/api/simulation'

const CARD_STYLE = {
  background: 'linear-gradient(160deg, #2d2154, #6b4d94)',
  boxShadow:
    '0 20px 45px rgba(20, 16, 43, 0.55), 0 0 40px rgba(107, 77, 148, 0.3)',
}

async function parseJsonOrNull(response) {
  const text = await response.text()
  return text ? JSON.parse(text) : null
}

async function readErrorMessage(response) {
  const text = await response.text()
  return text || `Request failed with status ${response.status}`
}

// completedAt arrives as a zoneless ISO string (e.g. "2026-08-29T02:12:48.88").
// Show it as "Aug 29, 2026"; fall back to the raw value if it won't parse.
function formatDate(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return isoString
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

function History() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  // runId of the card whose reflection is currently being fetched — used to
  // disable that card's button so a double-click can't fire two requests.
  const [openingRunId, setOpeningRunId] = useState(null)

  // A missing/expired/invalid token reaches the backend as an anonymous
  // request, which Spring Security rejects with a bare 403 — treat 401/403
  // as "session is stale" and send the user back to log in, matching
  // CareerSelection.jsx.
  async function handleFailedResponse(response) {
    if (response.status === 401 || response.status === 403) {
      logout()
      navigate('/login', { state: { sessionExpired: true } })
      return
    }
    setErrorMessage(await readErrorMessage(response))
  }

  useEffect(() => {
    let cancelled = false

    async function loadHistory() {
      const token = localStorage.getItem('authToken')
      try {
        const response = await fetch(`${SIMULATION_API_BASE}/history`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (cancelled) return
        if (!response.ok) {
          await handleFailedResponse(response)
          return
        }
        const data = await parseJsonOrNull(response)
        if (!cancelled) setEntries(Array.isArray(data) ? data : [])
      } catch (err) {
        if (!cancelled) {
          setErrorMessage(
            err.message || 'Something went wrong while loading your history.',
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadHistory()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleViewReflection(runId) {
    if (openingRunId) return
    setErrorMessage('')
    setOpeningRunId(runId)
    const token = localStorage.getItem('authToken')

    try {
      const response = await fetch(`${SIMULATION_API_BASE}/${runId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) {
        setOpeningRunId(null)
        await handleFailedResponse(response)
        return
      }

      const data = await parseJsonOrNull(response)

      // Reopen the run's saved reflection, not a fresh one — hand the stored
      // aiReflection + trait totals straight to the Reflection page via router
      // state, the exact shape Simulation.jsx passes it live.
      if (!data?.aiReflection) {
        setOpeningRunId(null)
        setErrorMessage(
          "This run's reflection isn't available to reopen.",
        )
        return
      }

      navigate('/reflection', {
        state: {
          careerTitle: data.careerTitle,
          aiReflection: data.aiReflection,
          accumulatedScores: data.accumulatedScores,
          runId: data.runId,
        },
      })
    } catch (err) {
      setOpeningRunId(null)
      setErrorMessage(
        err.message || 'Something went wrong while opening this reflection.',
      )
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#14102b] pl-[76px] font-sans text-[#f2e9dc] sm:pl-[236px]">
      <PrivateNavbar />

      <main className="mx-auto max-w-3xl px-5 pb-24 pt-28 sm:pt-32">
        <header className="mb-8 text-center">
          <h1 className="font-serif text-3xl font-medium tracking-wide text-[#d9a94f] sm:text-4xl">
            Your Career History
          </h1>
        </header>

        {errorMessage && (
          <div
            className="mb-6 rounded-2xl border border-[#d9a94f]/40 bg-[#14102b]/60 px-5 py-4 text-sm text-[#f2e9dc]/85"
            role="alert"
          >
            {errorMessage}
          </div>
        )}

        {loading ? (
          <p className="py-16 text-center text-sm text-[#f2e9dc]/60">
            Loading your history…
          </p>
        ) : entries.length === 0 ? (
          <div
            className="rounded-3xl p-8 text-center sm:p-10"
            style={CARD_STYLE}
          >
            <p className="text-[15px] leading-loose text-[#f2e9dc]/85 sm:text-base">
              You haven&rsquo;t experienced a career simulation yet. Head back to
              your Dashboard to get started.
            </p>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="mt-6 rounded-full px-8 py-3 text-sm font-medium tracking-wide shadow-lg transition-transform duration-150 ease-out active:scale-95"
              style={{ backgroundColor: '#d9a94f', color: '#14102b' }}
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <ul className="flex flex-col gap-5">
            {entries.map((entry) => {
              const isOpening = openingRunId === entry.runId
              return (
                <li
                  key={entry.runId}
                  className="flex flex-col gap-4 rounded-3xl p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
                  style={CARD_STYLE}
                >
                  <div>
                    <h2 className="font-serif text-xl font-medium tracking-wide text-[#f2e9dc] sm:text-2xl">
                      {entry.careerTitle}
                    </h2>
                    <p className="mt-1 text-sm text-[#f2e9dc]/70">
                      {formatDate(entry.completedAt)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleViewReflection(entry.runId)}
                    disabled={openingRunId !== null}
                    className="shrink-0 self-start rounded-full px-6 py-2.5 text-sm font-medium tracking-wide shadow-lg transition-transform duration-150 ease-out active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
                    style={{ backgroundColor: '#d9a94f', color: '#14102b' }}
                  >
                    {isOpening ? 'Opening…' : 'View Reflection'}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default History
