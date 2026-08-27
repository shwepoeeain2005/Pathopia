import { useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts'

// Exact copy required by the spec — do not paraphrase or reflow.
const DISCLAIMER_TEXT =
  'ဤ Reflection သည် အနာဂတ်ကို ခန့်မှန်းခြင်း မဟုတ်ပါ။ Pathopia သည် ' +
  'သင့်အား အမှန်တကယ့် အလုပ်အကိုင် အခြေအနေများကို ခံစားစမ်းသပ်စေပြီး ' +
  'သင့်ရွေးချယ်မှုများ၊ တုံ့ပြန်ပုံများအပေါ် အခြေခံ၍ ဆင်ခြင်စရာများသာ ' +
  'ပေးအပ်ခြင်း ဖြစ်ပါသည်။'

// History page isn't built yet, so "View in History" lands on the dashboard
// for now. Swap this to '/history' once that route exists.
const HISTORY_ROUTE = '/dashboard'

// "technical-analysis" -> "Technical Analysis"
function formatTraitLabel(key) {
  return key
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Trait totals can be negative (some choices subtract), and the radar only
// renders sensibly on a positive scale. Rescale every value into a fixed
// display band per-render: the lowest trait still gets a visible arm, the
// highest reaches the edge, and the shape between them is preserved. These
// are display coordinates only — the real numbers are never surfaced in the
// UI (no tooltip, no radius ticks).
function buildRadarData(scores) {
  const entries = Object.entries(scores).filter(
    ([, value]) => typeof value === 'number' && Number.isFinite(value),
  )
  if (entries.length === 0) return []

  const values = entries.map(([, value]) => value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const DISPLAY_FLOOR = 25
  const DISPLAY_CEIL = 100

  return entries.map(([key, value]) => ({
    trait: formatTraitLabel(key),
    value:
      DISPLAY_FLOOR + ((value - min) / span) * (DISPLAY_CEIL - DISPLAY_FLOOR),
  }))
}

function ReflectionSection({ title, body }) {
  if (!body) return null
  return (
    <section
      className="rounded-3xl border border-[#6b4d94]/30 p-6 sm:p-8"
      style={{
        background:
          'linear-gradient(150deg, rgba(45, 33, 84, 0.55), rgba(107, 77, 148, 0.22))',
        boxShadow: '0 16px 40px rgba(20, 16, 43, 0.45)',
      }}
    >
      <h2 className="font-serif text-xl sm:text-2xl font-medium tracking-wide text-[#d9a94f] mb-3">
        {title}
      </h2>
      <p className="whitespace-pre-line text-[15px] sm:text-base leading-loose text-[#f2e9dc]/85">
        {body}
      </p>
    </section>
  )
}

function Reflection() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state

  const sections = useMemo(() => {
    if (!state?.aiReflection) return null
    try {
      return JSON.parse(state.aiReflection)
    } catch {
      return null
    }
  }, [state])

  const radarData = useMemo(() => {
    if (!state?.accumulatedScores) return []
    try {
      return buildRadarData(JSON.parse(state.accumulatedScores))
    } catch {
      return []
    }
  }, [state])

  // Landing here without a generated reflection (direct URL, hard refresh
  // that drops router state) has nothing to show — send them back.
  useEffect(() => {
    if (!sections) navigate('/dashboard', { replace: true })
  }, [sections, navigate])

  if (!sections) return null

  const careerTitle = state?.careerTitle || 'Your Simulation'

  return (
    <div className="min-h-screen w-full bg-[#14102b] text-[#f2e9dc] font-sans">
      <div className="mx-auto flex max-w-3xl flex-col gap-7 px-5 py-14 sm:py-20">
        <header className="text-center">
          <h1 className="font-serif text-3xl font-medium tracking-wide text-[#d9a94f] sm:text-4xl">
            {careerTitle} — Simulation Complete
          </h1>
        </header>

        <div className="rounded-2xl border border-[#6b4d94]/35 bg-[#14102b]/50 px-5 py-4">
          <p className="text-[13px] leading-relaxed text-[#f2e9dc]/60">
            {DISCLAIMER_TEXT}
          </p>
        </div>

        <ReflectionSection
          title="What You Experienced"
          body={sections.whatYouExperienced}
        />
        <ReflectionSection
          title="Your Decision Pattern"
          body={sections.decisionPattern}
        />

        {radarData.length >= 3 && (
          <section
            className="rounded-3xl border border-[#6b4d94]/30 p-6 sm:p-8"
            style={{
              background:
                'linear-gradient(150deg, rgba(45, 33, 84, 0.55), rgba(107, 77, 148, 0.22))',
              boxShadow: '0 16px 40px rgba(20, 16, 43, 0.45)',
            }}
          >
            <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.22em] text-[#d9a94f]/80">
              Tendencies Observed
            </p>
            <div className="h-[360px] w-full sm:h-[420px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="70%">
                  <PolarGrid stroke="#6b4d94" strokeOpacity={0.35} />
                  <PolarAngleAxis
                    dataKey="trait"
                    tick={{
                      fill: '#f2e9dc',
                      fillOpacity: 0.8,
                      fontSize: 11,
                      fontFamily: 'Quicksand, system-ui, sans-serif',
                    }}
                  />
                  {/* Radial scale hidden entirely — no numbers anywhere. */}
                  <PolarRadiusAxis
                    domain={[0, 100]}
                    tick={false}
                    axisLine={false}
                    tickCount={5}
                  />
                  <Radar
                    dataKey="value"
                    stroke="#d9a94f"
                    strokeWidth={2}
                    fill="#6b4d94"
                    fillOpacity={0.35}
                    dot={{ fill: '#d9a94f', stroke: '#d9a94f', r: 3 }}
                    isAnimationActive
                  />
                  {/* No <Tooltip> on purpose: hovering must never reveal the
                      underlying trait numbers. */}
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        <ReflectionSection
          title="How You Approached Pressure"
          body={sections.pressureApproach}
        />
        <ReflectionSection
          title="Challenges You May Face"
          body={sections.challengesAhead}
        />
        <ReflectionSection
          title="Career Compatibility"
          body={sections.careerCompatibility}
        />

        <div className="flex flex-col justify-center gap-3 pt-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="rounded-full px-8 py-3 text-sm font-medium tracking-wide shadow-lg transition-transform duration-150 ease-out active:scale-95"
            style={{ backgroundColor: '#d9a94f', color: '#14102b' }}
          >
            Back to Dashboard
          </button>
          <button
            type="button"
            onClick={() => navigate(HISTORY_ROUTE)}
            className="rounded-full border border-[#6b4d94] px-8 py-3 text-sm font-medium tracking-wide text-[#f2e9dc] transition-colors duration-150 ease-out hover:border-[#8a6bb3] hover:bg-[#6b4d94]/20 active:scale-95"
          >
            View in History
          </button>
        </div>
      </div>
    </div>
  )
}

export default Reflection
