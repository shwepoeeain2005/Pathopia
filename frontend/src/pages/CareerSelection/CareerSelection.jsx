import { BarChart2, ClipboardCheck, Code2, PenTool } from 'lucide-react'
import PrivateNavbar from '../../components/PrivateNavbar.jsx'
import Footer from '../../components/Footer.jsx'
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
          {CAREERS.map((career) => {
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
      </main>

      <Footer />
    </div>
  )
}

export default CareerSelection
