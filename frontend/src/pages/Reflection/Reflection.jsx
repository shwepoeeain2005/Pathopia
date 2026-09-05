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
import { ArrowLeft, ScrollText, TriangleAlert } from 'lucide-react'
import { playSfx } from '../../lib/audioEngine.js'
import { SFX } from '../../lib/audioTracks.js'
import './Reflection.css'
import decisionPatternIcon from '../../assets/Decision_Pattern_icon.webp'
import pressureIcon from '../../assets/Pressure_icon.webp'
import challengesIcon from '../../assets/challenges_icon.webp'
import careerCompatibilityIcon from '../../assets/career_compatibility_icon.webp'

// Exact copy required by the spec — do not paraphrase or reflow.
const DISCLAIMER_TEXT =
  'ဤ Reflection သည် အနာဂတ်ကို ခန့်မှန်းခြင်း မဟုတ်ပါ။ Pathopia သည် ' +
  'သင့်အား အမှန်တကယ့် အလုပ်အကိုင် အခြေအနေများကို ခံစားစမ်းသပ်စေပြီး ' +
  'သင့်ရွေးချယ်မှုများ၊ တုံ့ပြန်ပုံများအပေါ် အခြေခံ၍ ဆင်ခြင်စရာများသာ ' +
  'ပေးအပ်ခြင်း ဖြစ်ပါသည်။'

// Sits directly under the disclaimer, in place of the old AI-generated
// "What You Experienced" section. Placeholder wording — lock the final
// Burmese copy the same way as DISCLAIMER_TEXT, do not paraphrase.
const REFLECTION_INTRO_TEXT =
  'အောက်တွင် သင့်ရွေးချယ်မှုများနှင့် တုံ့ပြန်ပုံများမှ တွေ့မြင်ရသည့် ပုံစံအချို့ကို ' +
  'ဆင်ခြင်စရာအဖြစ်သာ တင်ပြပါမည်။ ၎င်းသည် အဆုံးအဖြတ် တစ်ခု မဟုတ်ပါ။'

const HISTORY_ROUTE = '/history'

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

// Each section gets its own accent — a warm-to-cool spread down the page,
// rather than every title reading the same gold.
const ACCENTS = {
  whatYouExperienced: '#d9a94f', // gold — legacy section
  decisionPattern: '#8fc9e6', // starlight blue
  tendenciesObserved: '#f2c94f', // yellow
  pressureApproach: '#f2a65a', // ember orange
  challengesAhead: '#e2776b', // rose red
  careerCompatibility: '#7fd9c4', // teal
}

// The large illustration for one row. `image` (the glossy 3D renders) takes
// priority; `icon` (a lucide component) is the fallback for the one section
// with no custom art yet. It still drifts gently up and down.
function RowIllustration({ icon: Icon, image, accent, size = 'md' }) {
  const sizeClasses =
    size === 'lg'
      ? 'h-44 w-44 sm:h-72 sm:w-72 lg:h-96 lg:w-96'
      : 'h-40 w-40 sm:h-64 sm:w-64 lg:h-80 lg:w-80'

  if (image) {
    return (
      <img
        src={image}
        alt=""
        aria-hidden="true"
        className={`reflection-icon-float ${sizeClasses} object-contain`}
      />
    )
  }

  return (
    <div
      className={`reflection-icon-float flex ${sizeClasses} items-center justify-center rounded-full`}
      style={{
        border: `1px solid ${accent}55`,
        background: `radial-gradient(circle, ${accent}26 0%, ${accent}0d 70%, transparent 100%)`,
      }}
    >
      <Icon className="h-20 w-20 sm:h-24 sm:w-24" style={{ color: accent }} strokeWidth={1.2} />
    </div>
  )
}

// One full-bleed, alternating row: illustration on one side, title + copy on
// the other. `side` picks which side the illustration sits on.
function ReflectionRow({ icon, image, accent, title, body, side = 'left', iconSize = 'md' }) {
  if (!body) return null
  const reverse = side === 'right'
  return (
    <div
      className={`flex flex-col items-center gap-10 sm:items-center sm:gap-16 lg:gap-24 ${
        reverse ? 'sm:flex-row-reverse' : 'sm:flex-row'
      }`}
    >
      <div className="flex flex-1 justify-center">
        <RowIllustration icon={icon} image={image} accent={accent} size={iconSize} />
      </div>
      <div className="flex-1 text-center sm:text-left">
        <h2 className="font-serif text-3xl font-semibold tracking-wide sm:text-3xl" style={{ color: accent }}>
          {title}
        </h2>
        <p className="mt-4 whitespace-pre-line text-base leading-loose text-[#f2e9dc]/85 sm:text-base">
          {body}
        </p>
      </div>
    </div>
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

  useEffect(() => {
    if (sections) playSfx(SFX.pianoJingle)
    // Only meant to fire once, the moment the page actually has a
    // reflection to show — not on every unrelated re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Boolean(sections)])

  if (!sections) return null

  const careerTitle = state?.careerTitle || 'Your Simulation'
  // This page is shared between two contexts: shown fresh right after a
  // simulation finishes (bottom buttons to move on), and reopened from
  // History to reread an old reflection (just a way back, no "finish" CTAs).
  const fromHistory = Boolean(state?.fromHistory)

  return (
    <div className="reflection-page night-sky-bg min-h-screen w-full text-[#f2e9dc] font-sans">
      {fromHistory && (
        <button
          type="button"
          onClick={() => navigate(HISTORY_ROUTE)}
          className="fixed left-5 top-5 z-30 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#d9a94f]/70 bg-[#14102b]/90 text-[#d9a94f] shadow-[0_0_18px_rgba(217,169,79,0.35)] backdrop-blur-sm transition-all hover:scale-105 hover:border-[#d9a94f] hover:shadow-[0_0_26px_rgba(217,169,79,0.55)] sm:left-8 sm:top-8"
          aria-label="Back to History"
        >
          <ArrowLeft className="h-6 w-6" strokeWidth={2.25} />
        </button>
      )}

      {/* Headline stays pinned at the top, in its own contained column —
          only the section rows below go full-width. */}
      <div className="reflection-page__content mx-auto flex max-w-2xl flex-col gap-7 px-5 pt-14 sm:pt-20">
        <header className="text-center">
          <h1 className="font-serif text-4xl font-medium tracking-wide text-[#d9a94f] sm:text-5xl">
            Simulation Complete
          </h1>
          <p className="mt-2 font-serif text-lg tracking-wide text-[#f2e9dc]/70 sm:text-xl">
            {careerTitle}
          </p>
        </header>

        <div className="flex gap-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-4 sm:gap-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-red-400/30 bg-red-500/15">
            <TriangleAlert className="h-4 w-4 text-red-300" strokeWidth={1.5} />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <p className="text-[13px] leading-relaxed text-[#f2e9dc]/60">
              {DISCLAIMER_TEXT}
            </p>
            <p className="text-[13px] leading-relaxed text-[#f2e9dc]/60">
              {REFLECTION_INTRO_TEXT}
            </p>
          </div>
        </div>
      </div>

      {/* Edge-to-edge, alternating rows — icon/illustration left, then
          right, then left, and so on down the page. */}
      <div className="reflection-page__content mx-auto flex max-w-6xl flex-col gap-16 px-6 py-16 sm:gap-24 sm:px-10 sm:py-24 lg:px-16">
        {/* Old AI "What You Experienced" section — no longer generated, but
            kept here so runs completed before this change still render it
            when reopened from History. New runs have no such key and this
            renders nothing. */}
        <ReflectionRow
          icon={ScrollText}
          accent={ACCENTS.whatYouExperienced}
          title="What You Experienced"
          body={sections.whatYouExperienced}
          side="right"
        />
        <ReflectionRow
          image={decisionPatternIcon}
          accent={ACCENTS.decisionPattern}
          title="Your Decision Pattern"
          body={sections.decisionPattern}
          side="left"
        />

        {radarData.length >= 3 && (
          <div className="flex flex-col items-center gap-10 sm:flex-row-reverse sm:gap-16 lg:gap-24">
            <div className="relative w-full flex-1">
              <span
                className="absolute right-0 top-0 z-10 shrink-0 rounded-full px-3 py-1 text-xs font-medium"
                style={{
                  border: `1px solid ${ACCENTS.tendenciesObserved}66`,
                  background: `${ACCENTS.tendenciesObserved}1a`,
                  color: ACCENTS.tendenciesObserved,
                }}
              >
                {radarData.length} traits
              </span>
              <div className="h-[320px] w-full sm:h-[400px] lg:h-[460px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} outerRadius="70%">
                    <PolarGrid stroke={ACCENTS.tendenciesObserved} strokeOpacity={0.55} />
                    <PolarAngleAxis
                      dataKey="trait"
                      tick={{
                        fill: '#f2e9dc',
                        fillOpacity: 0.9,
                        fontSize: 14,
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
                      stroke={ACCENTS.tendenciesObserved}
                      strokeWidth={2}
                      fill={ACCENTS.tendenciesObserved}
                      fillOpacity={0.3}
                      dot={{
                        fill: ACCENTS.tendenciesObserved,
                        stroke: ACCENTS.tendenciesObserved,
                        r: 3,
                      }}
                      isAnimationActive
                    />
                    {/* No <Tooltip> on purpose: hovering must never reveal
                        the underlying trait numbers. */}
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2
                className="font-serif text-3xl font-semibold tracking-wide sm:text-4xl"
                style={{ color: ACCENTS.tendenciesObserved }}
              >
                Tendencies Observed
              </h2>
            </div>
          </div>
        )}

        <ReflectionRow
          image={pressureIcon}
          accent={ACCENTS.pressureApproach}
          title="How You Approached Pressure"
          body={sections.pressureApproach}
          side="left"
        />
        <ReflectionRow
          image={challengesIcon}
          accent={ACCENTS.challengesAhead}
          title="Challenges You May Face"
          body={sections.challengesAhead}
          side="right"
          iconSize="lg"
        />
        <ReflectionRow
          image={careerCompatibilityIcon}
          accent={ACCENTS.careerCompatibility}
          title="Career Compatibility"
          body={sections.careerCompatibility}
          side="left"
          iconSize="lg"
        />

        {!fromHistory && (
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
        )}
      </div>
    </div>
  )
}

export default Reflection
