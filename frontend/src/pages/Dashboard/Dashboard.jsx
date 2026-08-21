import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PrivateNavbar from '../../components/PrivateNavbar.jsx'
import Footer from '../../components/Footer.jsx'
import heroBackground from '../../assets/landing/hero-background.png'
import './Dashboard.css'

function SparkleIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" />
    </svg>
  )
}

function DashboardActionButton({ label, onClick, disabled }) {
  return (
    <button
      type="button"
      className="dashboard__action-btn"
      onClick={onClick}
      disabled={disabled}
    >
      <SparkleIcon className="dashboard__action-sparkle dashboard__action-sparkle--tl" />
      <SparkleIcon className="dashboard__action-sparkle dashboard__action-sparkle--br" />
      <span className="dashboard__action-label">{label}</span>
    </button>
  )
}

function Dashboard() {
  const navigate = useNavigate()
  const userName = localStorage.getItem('fullName') || 'there'

  // No endpoint yet returns "does this user have ANY unfinished run" across
  // careers (only per-career check-unfinished exists) — defaults to false
  // until that's built, so this stays honestly disabled rather than faked.
  const [hasUnfinishedSimulation] = useState(false)

  return (
    <div className="dashboard">
      <PrivateNavbar />

      <div className="dashboard__welcome-wrap">
        <section
          className="dashboard__welcome"
          style={{ backgroundImage: `url(${heroBackground})` }}
        >
          <div className="dashboard__welcome-overlay" />
          <div className="dashboard__welcome-content">
            <h1 className="dashboard__welcome-heading">Welcome back, {userName}!</h1>
            <p className="dashboard__welcome-subtext">
              A glimpse into your future, before you choose.
            </p>
          </div>
        </section>
      </div>

      <main className="dashboard__main">
        <div className="dashboard__actions">
          <DashboardActionButton
            label="Start Simulation"
            onClick={() => navigate('/career-selection')}
          />
          <DashboardActionButton
            label="Continue Simulation"
            disabled={!hasUnfinishedSimulation}
          />
          <DashboardActionButton label="Recent History" />
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Dashboard
