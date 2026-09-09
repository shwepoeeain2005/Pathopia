import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import PrivateNavbar from '../../components/PrivateNavbar.jsx'
import Footer from '../../components/Footer.jsx'
import DeleteRunModal from '../../components/DeleteRunModal.jsx'
import { logout } from '../../lib/auth.js'
import { useScrollReveal, revealClass } from '../../hooks/useScrollReveal.js'
import backToTopIcon from '../../assets/landing/back-to-top-icon.png'
import './History.css'

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

function formatTime(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

// Bucket the runs by the calendar day they finished (the "YYYY-MM-DD" head
// of the zoneless timestamp), newest day first, newest run first within a
// day.
function groupByDate(entries) {
  const buckets = new Map()
  for (const entry of entries) {
    const key = (entry.completedAt || '').slice(0, 10) || 'unknown'
    if (!buckets.has(key)) buckets.set(key, [])
    buckets.get(key).push(entry)
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => (a < b ? 1 : a > b ? -1 : 0))
    .map(([dateKey, items]) => ({
      dateKey,
      dateLabel:
        dateKey === 'unknown' ? 'Date unknown' : formatDate(items[0].completedAt),
      items: [...items].sort((a, b) =>
        (a.completedAt || '') < (b.completedAt || '') ? 1 : -1,
      ),
    }))
}

// One date panel, fading/rising in the first time it scrolls into view.
// `.history__group` has no hover transform/transition of its own (unlike
// the run cards inside it), so the reveal classes go directly on it —
// no extra wrapper needed here.
function HistoryGroup({ group, openingRunId, onViewReflection, onRequestDelete }) {
  const [ref, isVisible] = useScrollReveal()
  return (
    <section ref={ref} className={`history__group ${revealClass(isVisible)}`}>
      <h2 className="history__date">{group.dateLabel}</h2>
      <ul className="history__list">
        {group.items.map((entry) => {
          const isOpening = openingRunId === entry.runId
          return (
            <li key={entry.runId} className="history-card">
              <div className="history-card__info">
                <h3 className="history-card__career">{entry.careerTitle}</h3>
                <p className="history-card__time">{formatTime(entry.completedAt)}</p>
              </div>

              <div className="history-card__actions">
                <button
                  type="button"
                  onClick={() => onViewReflection(entry.runId)}
                  disabled={openingRunId !== null}
                  className="history-card__btn"
                >
                  <span className="history-card__btn-label">
                    {isOpening ? 'Opening…' : 'View Reflection'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onRequestDelete(entry)}
                  disabled={openingRunId !== null}
                  className="history-card__delete"
                  aria-label={`Delete ${entry.careerTitle} run`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function History() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  // runId of the card whose reflection is currently being fetched — used to
  // disable that card's button so a double-click can't fire two requests.
  const [openingRunId, setOpeningRunId] = useState(null)
  // 'all', or a "YYYY-MM-DD" key from the date dropdown.
  const [dateFilter, setDateFilter] = useState('all')
  const [showBackToTop, setShowBackToTop] = useState(false)
  // The entry pending a delete confirmation (null when the modal is closed).
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

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

  const groups = useMemo(() => groupByDate(entries), [entries])
  const visibleGroups =
    dateFilter === 'all'
      ? groups
      : groups.filter((group) => group.dateKey === dateFilter)

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
          // Tells Reflection.jsx it's being reopened, not shown fresh at the
          // end of a simulation — swaps the bottom buttons for a back link.
          fromHistory: true,
        },
      })
    } catch (err) {
      setOpeningRunId(null)
      setErrorMessage(
        err.message || 'Something went wrong while opening this reflection.',
      )
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget || isDeleting) return
    setIsDeleting(true)
    setErrorMessage('')
    const token = localStorage.getItem('authToken')

    try {
      const response = await fetch(`${SIMULATION_API_BASE}/${deleteTarget.runId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) {
        setIsDeleting(false)
        await handleFailedResponse(response)
        return
      }

      setEntries((prev) => prev.filter((entry) => entry.runId !== deleteTarget.runId))
      setDeleteTarget(null)
    } catch (err) {
      setErrorMessage(
        err.message || 'Something went wrong while deleting this run.',
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="history night-sky-bg min-h-screen w-full pl-[76px] font-sans text-[#f2e9dc] sm:pl-[236px]">
      <PrivateNavbar />

      <main className="mx-auto max-w-3xl px-5 pb-24 pt-28 sm:pt-32">
        <header className="mb-8 text-center">
          <h1 className="font-serif text-4xl font-medium tracking-wide text-[#d9a94f] sm:text-5xl">
            Your Career History
          </h1>
          <p className="mt-3 text-[#c7c9d6]">
            Look back on the simulations you&rsquo;ve completed.
          </p>
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
          <>
            <div className="history__filter">
              <label className="history__filter-label" htmlFor="history-date-filter">
                Filter by date
              </label>
              <select
                id="history-date-filter"
                className="history__filter-select"
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
              >
                <option value="all">All dates</option>
                {groups.map((group) => (
                  <option key={group.dateKey} value={group.dateKey}>
                    {group.dateLabel}
                  </option>
                ))}
              </select>
            </div>

            {visibleGroups.map((group) => (
              <HistoryGroup
                key={group.dateKey}
                group={group}
                openingRunId={openingRunId}
                onViewReflection={handleViewReflection}
                onRequestDelete={setDeleteTarget}
              />
            ))}
          </>
        )}
      </main>

      <Footer />

      <button
        type="button"
        className={`history__back-to-top${showBackToTop ? ' history__back-to-top--visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Back to top"
      >
        <img src={backToTopIcon} alt="" />
      </button>

      {deleteTarget && (
        <DeleteRunModal
          careerTitle={deleteTarget.careerTitle}
          isDeleting={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}

export default History
