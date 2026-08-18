import PrivateNavbar from '../../components/PrivateNavbar.jsx'
import './CareerSelection.css'

const SIMULATION_API_BASE = '/api/simulation'

// NOTE: the `careers` table is empty in the shared dev database right now
// (no seed data has been added yet), so these ids are placeholders that
// match the examples in Career.java's comments. Swap them for the real
// ids once seed data exists.
const CAREERS = [
  {
    id: 'data-analyst',
    title: 'Data Analyst',
    tagline: 'Turn raw numbers into real decisions.',
  },
  {
    id: 'project-manager',
    title: 'Project Manager',
    tagline: 'Keep the moving pieces on track.',
  },
  {
    id: 'software-engineer',
    title: 'Software Engineer',
    tagline: 'Coming Soon',
    comingSoon: true,
  },
  {
    id: 'ui-ux-designer',
    title: 'UI/UX Designer',
    tagline: 'Shape how people experience the product.',
  },
]

async function parseJsonOrNull(response) {
  const text = await response.text()
  return text ? JSON.parse(text) : null
}

async function handleCareerClick(career) {
  const token = localStorage.getItem('authToken')

  try {
    const checkResponse = await fetch(
      `${SIMULATION_API_BASE}/check-unfinished/${career.id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    )

    if (!checkResponse.ok) {
      throw new Error(`check-unfinished failed with status ${checkResponse.status}`)
    }

    const unfinishedRun = await parseJsonOrNull(checkResponse)

    if (unfinishedRun) {
      // TODO: replace with the real Resume Conflict modal once it's built.
      alert(
        `You have an unfinished ${career.title} simulation. Resume or start new?`,
      )
      return
    }

    const startResponse = await fetch(`${SIMULATION_API_BASE}/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ careerId: career.id }),
    })

    if (!startResponse.ok) {
      console.error(`start failed with status ${startResponse.status}:`, await startResponse.text())
      return
    }

    const startResult = await parseJsonOrNull(startResponse)
    console.log(startResult)
  } catch (err) {
    console.error(err)
  }
}

function CareerSelection() {
  return (
    <div className="career-selection">
      <PrivateNavbar />

      <main className="career-selection__main">
        <h1 className="career-selection__heading">Choose Your Path</h1>
        <p className="career-selection__subheading">
          Pick a career to step into its simulation.
        </p>

        <div className="career-selection__grid">
          {CAREERS.map((career) => (
            <button
              key={career.id}
              type="button"
              className={`career-card${career.comingSoon ? ' career-card--disabled' : ''}`}
              onClick={() => !career.comingSoon && handleCareerClick(career)}
              disabled={career.comingSoon}
              aria-disabled={career.comingSoon || undefined}
            >
              {career.comingSoon && (
                <span className="career-card__badge">Coming Soon</span>
              )}
              <h2 className="career-card__title">{career.title}</h2>
              {!career.comingSoon && (
                <p className="career-card__tagline">{career.tagline}</p>
              )}
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}

export default CareerSelection
