import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Lightbulb, LogOut, Phone, Volume2 } from 'lucide-react'
import LeaveSimulationModal from '../../components/LeaveSimulationModal.jsx'
import PhoneCallOverlay from '../../components/PhoneCallOverlay.jsx'
import AudioModal from '../../components/AudioModal.jsx'
import CosmicModal from '../../components/CosmicModal.jsx'
import LoadingScreen from '../../components/LoadingScreen.jsx'
import { logout } from '../../lib/auth.js'
import { useAudioSettings } from '../../hooks/useAudioSettings.js'
import {
  playMusic,
  stopMusic,
  playSfx,
  pickMoodTrack,
  startLoopingSfx,
  stopLoopingSfx,
  setMusicDucking,
} from '../../lib/audioEngine.js'
import { CHUNK_SFX, MUSIC, SFX } from '../../lib/audioTracks.js'

const SIMULATION_API_BASE = '/api/simulation'
const TOTAL_MOMENTS = 8
const TYPE_INTERVAL_MS = 24
// One character per tick, always — a fixed reveal rate so every line types
// at the same speed regardless of its length (see the typing effect below).
const TYPE_CHARS_PER_TICK = 1
const CHOICE_FADE_OUT_MS = 350
const MOMENT_FADE_MS = 450
const MOMENT_BLACK_HOLD_MS = 150
const INTRO_LOADER_MIN_MS = 1300
const INTRO_LOADER_FADE_MS = 500
const DIALOGUE_BOX_DELAY_MS = 1000
const DIALOGUE_BOX_ENTRANCE_MS = 500

// Reflection generation starts on the backend the moment the final choice is
// submitted. The frontend just polls the run until aiReflection lands; if it
// hasn't after REFLECTION_FALLBACK_MS we force the regenerate endpoint ONCE,
// and give up entirely after REFLECTION_HARD_TIMEOUT_MS.
const REFLECTION_POLL_INTERVAL_MS = 2000
// After this long with no reflection, re-trigger the backend job once (it may
// have died on a transient Gemini error). Only fired a single time — on a weak
// connection a genuine call can be slow, and each re-trigger costs another
// Gemini request against the free-tier daily quota.
const REFLECTION_FALLBACK_MS = 90000
// Give up and show the retry card after this. Must stay safely above the
// backend's own worst case: connectTimeout(25s) + readTimeout(120s) per
// attempt, times up to 2 attempts, plus backoff — ~4.9 minutes on a
// connection so weak it hits max timeout on every stage. A shorter value
// here risked the frontend giving up right before the backend would have
// succeeded.
const REFLECTION_HARD_TIMEOUT_MS = 330000

// Static replacement for the old AI-generated "What You Experienced"
// reflection section, shown as its own screen after the final Reality box
// while the AI sections generate in the background. Placeholder wording —
// lock the final Burmese copy before shipping, do not paraphrase.
function whatYouExperiencedText(careerTitle) {
  return (
    `ဒီ Simulation တစ်ခုလုံးမှာ သင်သည် ${careerTitle} တစ်ဦးအဖြစ် ` +
    'အလုပ်ခွင်တစ်နေ့တာကို ဖြတ်သန်းခဲ့ပါသည်။ အခြေအနေအမျိုးမျိုးတွင် ' +
    'ရွေးချယ်ဆုံးဖြတ်ခဲ့ရပြီး၊ ရွေးချယ်မှုတိုင်း၏ နောက်ကွယ်မှ အမှန်တရားကိုလည်း ' +
    'တွေ့မြင်ခဲ့ရပါသည်။ ဆက်လက်၍ သင့်ဆုံးဖြတ်ပုံများအပေါ် အခြေခံသည့် ' +
    'ဆင်ခြင်စရာအချို့ကို တင်ပြပါမည်။'
  )
}

// Dashboard doesn't call the backend to decide whether to enable "Continue
// Simulation" — instead we track the active run client-side: this page
// records it here whenever a run is in progress, and clears it once the run
// completes. Dashboard reads these to know what to resume. (The backend
// /check-unfinished endpoint does report the user's newest unfinished run,
// but Dashboard hasn't been switched over to it.)
const ACTIVE_RUN_ID_KEY = 'activeSimulationRunId'
const ACTIVE_RUN_CAREER_KEY = 'activeSimulationCareerTitle'

function authHeaders() {
  const token = localStorage.getItem('authToken')
  return { Authorization: `Bearer ${token}` }
}

// Deterministic left/right placement per speaker (not purely centered every
// time) so different characters visually claim different sides of the
// scene, while the same character always lands on the same side.
function getCharacterSide(speaker) {
  if (!speaker) return 'right'
  let hash = 0
  for (let i = 0; i < speaker.length; i += 1) {
    hash = (hash * 31 + speaker.charCodeAt(i)) | 0
  }
  return Math.abs(hash) % 2 === 0 ? 'left' : 'right'
}

// Scenario phases are stored as "Onboarding" or "Phase N" (1-8). The moment
// badge is just that trailing number — 0 (hidden) for onboarding/unknown —
// read straight off whatever scenario the backend says is current, so it
// stays correct across a refresh instead of relying on a client-side count.
function getMomentNumber(phase) {
  const match = /Phase\s+(\d+)/i.exec(phase || '')
  return match ? Number(match[1]) : 0
}

function parseDialogueChunks(raw) {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// The reality_text content is authored as one continuous block with no
// paragraph breaks, which reads as a dense wall of text in the modal.
// Since we can't touch the underlying content, split it into a few
// visual paragraphs here purely for display, grouping sentences (split
// on the Burmese sentence-final "။") into at most 3 roughly-even chunks.
function splitIntoParagraphs(text) {
  if (!text) return []
  const sentences = text
    .split('။')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => `${s}။`)
  if (sentences.length <= 2) return [sentences.join(' ')]

  const targetParagraphs = Math.min(3, Math.ceil(sentences.length / 2))
  const perParagraph = Math.ceil(sentences.length / targetParagraphs)
  const paragraphs = []
  for (let i = 0; i < sentences.length; i += perParagraph) {
    paragraphs.push(sentences.slice(i, i + perParagraph).join(' '))
  }
  return paragraphs
}

function RealityModal({ text, onNext }) {
  useEffect(() => {
    playSfx(SFX.pianoJingle)
  }, [])

  return (
    <CosmicModal size="lg" labelledBy="reality-modal-title">
      <div className="flex flex-col items-center text-center mb-5">
        <div className="w-14 h-14 rounded-full bg-[#6b4d94]/25 flex items-center justify-center mb-5 border border-[#c4d0ff]/30">
          <Lightbulb className="w-6 h-6 text-[#d9a94f]" />
        </div>
        <h2
          id="reality-modal-title"
          className="font-serif text-3xl font-medium tracking-wide text-[#d9a94f]"
        >
          Behind the Career
        </h2>
      </div>

      <div className="w-full flex flex-col gap-4 text-left text-base leading-relaxed text-[#f2e9dc]/85">
        {splitIntoParagraphs(text).map((paragraph, i) => (
          <p key={i} className="whitespace-pre-line">
            {paragraph}
          </p>
        ))}
      </div>

      <button
        type="button"
        onClick={onNext}
        className="w-full mt-8 py-4 rounded-full text-sm font-medium tracking-wide shadow-lg transition-transform duration-150 ease-out active:scale-95"
        style={{ backgroundColor: '#d9a94f', color: '#14102b' }}
      >
        Next
      </button>
    </CosmicModal>
  )
}

// Shown once, right after the final Reality box: a static "What You
// Experienced" recap while the AI reflection sections finish generating in
// the background. "Get Reflection" moves on to the loading state.
function ExperiencedScreen({ careerTitle, onContinue }) {
  return (
    <CosmicModal size="lg" labelledBy="experienced-screen-title">
      <div className="flex flex-col items-center text-center mb-5">
        <div className="w-14 h-14 rounded-full bg-[#6b4d94]/25 flex items-center justify-center mb-5 border border-[#c4d0ff]/30">
          <Lightbulb className="w-6 h-6 text-[#d9a94f]" />
        </div>
        <h2
          id="experienced-screen-title"
          className="font-serif text-3xl font-medium tracking-wide text-[#d9a94f]"
        >
          What You Experienced
        </h2>
      </div>

      <p className="w-full text-left text-base leading-relaxed text-[#f2e9dc]/85 whitespace-pre-line">
        {whatYouExperiencedText(careerTitle)}
      </p>

      <button
        type="button"
        onClick={onContinue}
        className="w-full mt-8 py-4 rounded-full text-sm font-medium tracking-wide shadow-lg transition-transform duration-150 ease-out active:scale-95"
        style={{ backgroundColor: '#d9a94f', color: '#14102b' }}
      >
        Get Reflection
      </button>
    </CosmicModal>
  )
}

function Simulation() {
  const location = useLocation()
  const navigate = useNavigate()

  const [simState, setSimState] = useState(location.state?.simulationState ?? null)
  const [loadError, setLoadError] = useState(null)

  const [chunkIndex, setChunkIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [allChunksShown, setAllChunksShown] = useState(false)
  // Separate from allChunksShown so the choice box's reveal can be held
  // back until any lingering character portrait has finished fading out,
  // instead of popping in at the same instant the fade-out starts.
  const [choicesReady, setChoicesReady] = useState(false)

  const [selectedOptionKey, setSelectedOptionKey] = useState(null)
  const [clickSequence, setClickSequence] = useState([])
  const [scenarioLoadedAt, setScenarioLoadedAt] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [pendingNextState, setPendingNextState] = useState(null)
  const [realityText, setRealityText] = useState(null)
  const [isBlackout, setIsBlackout] = useState(false)

  // Reflection wait state, only meaningful once the run's final scene is
  // reached (allChunksShown && status === 'completed'):
  //   null      -> static "What You Experienced" screen + Get Reflection
  //   'loading' -> LoadingScreen while we poll for the AI reflection
  //   'error'   -> generation failed / timed out, with a retry
  // Backend already started generating the moment the final choice was
  // submitted; this is just the client waiting for it to land.
  const [completionPhase, setCompletionPhase] = useState(null)
  const [reflectionError, setReflectionError] = useState(null)
  const reflectionPollRef = useRef(null)

  const [showIntroLoader, setShowIntroLoader] = useState(true)
  const [introLoaderHiding, setIntroLoaderHiding] = useState(false)
  const [showDialogueBox, setShowDialogueBox] = useState(false)
  const [dialogueBoxRevealed, setDialogueBoxRevealed] = useState(false)

  const [displayedCharacter, setDisplayedCharacter] = useState(null)
  const [characterVisible, setCharacterVisible] = useState(false)

  const [leaveModalOpen, setLeaveModalOpen] = useState(false)
  const [audioModalOpen, setAudioModalOpen] = useState(false)
  const { musicEnabled, sfxEnabled, volume, setMusicEnabled, setSfxEnabled, setVolume } =
    useAudioSettings()

  const typingTimeoutRef = useRef(null)

  // Resolve current state from the backend on every mount, even when
  // router state already handed us a simulationState payload to paint
  // immediately. That payload is a snapshot frozen at navigation time —
  // location.state never updates itself as the run progresses — so on any
  // remount after the run has advanced (a hard refresh, browser
  // back/forward, or a dev hot-reload) it would otherwise still show
  // whichever scenario was current back when we first navigated here,
  // silently out of sync with the backend's real current scenario. Treat
  // it as an optimistic first paint only, and always re-fetch the
  // authoritative state right behind it.
  useEffect(() => {
    const runId = location.state?.runId ?? location.state?.simulationState?.runId
    if (!runId) {
      if (!simState) navigate('/dashboard', { replace: true })
      return
    }
    const hadOptimisticState = Boolean(simState)
    let cancelled = false
    fetch(`${SIMULATION_API_BASE}/${runId}/resume`, {
      method: 'POST',
      headers: authHeaders(),
    })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          logout()
          navigate('/login', { state: { sessionExpired: true } })
          return null
        }
        if (!res.ok) throw new Error(`resume failed with status ${res.status}`)
        return res.json()
      })
      .then((data) => {
        if (!cancelled && data) setSimState(data)
      })
      .catch((err) => {
        if (!cancelled && !hadOptimisticState) setLoadError(err.message)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const chunks = useMemo(() => parseDialogueChunks(simState?.dialogueChunks), [simState])
  const currentChunk = chunks[chunkIndex] ?? null
  const momentNumber = getMomentNumber(simState?.phase)

  // "Continue Simulation" on Dashboard only hands over a runId, not the
  // scenario itself — resolving it (the /resume call below) can take a
  // moment, and cold-starting the database occasionally takes much longer.
  // Cut whatever page music was already playing the instant this page is
  // entered, rather than leaving it running until real scene data (and the
  // mood it picks) arrives.
  useEffect(() => {
    stopMusic()
  }, [])

  // Background music for the scene: each scenario's own `mood` (set on its
  // dialogue chunks in Neon, from what's actually happening in that scene)
  // — unless a chunk flags an ambience bed instead (e.g. an office scene),
  // which replaces the mood music entirely rather than layering under it.
  // `ambience` isn't set anywhere yet, so that branch is currently dormant.
  useEffect(() => {
    if (!simState) return
    const officeScene = chunks.some((chunk) => chunk.ambience === 'office')
    playMusic(
      officeScene
        ? MUSIC.officeAmbience
        : pickMoodTrack(chunks, momentNumber, simState.status),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [momentNumber, simState?.status, chunks])

  // Dialogue chunks can flag a one-shot sound tied to that specific line —
  // `phone: true` already drives the phone-call visual and now also rings
  // once per phone chunk; `sfx` is the same idea for door-slam / heartbeat /
  // footsteps, set by whoever authors that scenario's content (a handful of
  // scenarios already set this; `heartbeat` and `walk-men` aren't used yet).
  useEffect(() => {
    if (!currentChunk) return
    if (currentChunk.phone) playSfx(SFX.phoneRinging)
    const cue = CHUNK_SFX[currentChunk.sfx]
    if (cue) {
      // Footsteps need to read clearly over the scene, so they get a boost
      // above the standard one-shot volume.
      const isWalking = currentChunk.sfx === 'walk-heels' || currentChunk.sfx === 'walk-men'
      playSfx(cue, { level: isWalking ? 1.6 : 1 })
    }
  }, [currentChunk])

  // Mirrors characterVisible into a ref so the effect below can check
  // "was a character already on screen right before this chunk change"
  // without depending on characterVisible itself (which it also writes to).
  const wasCharacterVisibleRef = useRef(false)
  useEffect(() => {
    wasCharacterVisibleRef.current = characterVisible
  }, [characterVisible])

  // Same idea for the portrait currently on screen — the effect below reads
  // its speaker to decide "same person, new expression" vs "different person"
  // without taking displayedCharacter as a dependency (which it also writes).
  const displayedCharacterRef = useRef(null)
  useEffect(() => {
    displayedCharacterRef.current = displayedCharacter
  }, [displayedCharacter])

  // Fades the character art instead of popping in/out with the chunk.
  // Three cases:
  //   - Same speaker as the portrait already on screen (just a different
  //     expression): swap the art directly, no re-fade.
  //   - A different person now speaking while a portrait is still up: fade
  //     the current one out, then swap in the new art and fade it back in —
  //     scenes that rotate through several characters (common for the
  //     UI/UX Designer career) would otherwise hard-cut between them.
  //   - Nothing on screen yet: mount the art invisible first, then reveal
  //     it on the next frame — the <img> must already exist in the DOM for
  //     a CSS opacity transition to animate; setting src and opacity=100 in
  //     the same commit skips the animation entirely.
  useEffect(() => {
    // Once dialogue is done and the choice box is about to take over, treat
    // it the same as "no character on this line" so whoever was speaking
    // fades out instead of lingering on screen through the choice box.
    const nextImage = allChunksShown ? null : currentChunk?.characterImage

    if (!nextImage) {
      const timeoutId = setTimeout(() => setCharacterVisible(false), 0)
      return () => clearTimeout(timeoutId)
    }

    const nextCharacter = {
      src: nextImage,
      side: getCharacterSide(currentChunk.speaker),
      alt: currentChunk.speaker || '',
    }

    if (wasCharacterVisibleRef.current) {
      const sameSpeaker = displayedCharacterRef.current?.alt === nextCharacter.alt

      if (sameSpeaker) {
        const timeoutId = setTimeout(() => setDisplayedCharacter(nextCharacter), 0)
        return () => clearTimeout(timeoutId)
      }

      // Different person: fade the old portrait out, then (once it's gone)
      // swap the art and fade the new one in.
      setCharacterVisible(false)
      let rafId = null
      const timeoutId = setTimeout(() => {
        setDisplayedCharacter(nextCharacter)
        rafId = requestAnimationFrame(() => setCharacterVisible(true))
      }, CHOICE_FADE_OUT_MS)
      return () => {
        clearTimeout(timeoutId)
        if (rafId) cancelAnimationFrame(rafId)
      }
    }

    let rafId = null
    const timeoutId = setTimeout(() => {
      setDisplayedCharacter(nextCharacter)
      rafId = requestAnimationFrame(() => setCharacterVisible(true))
    }, 0)
    return () => {
      clearTimeout(timeoutId)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [currentChunk, allChunksShown])

  // Keep localStorage in sync with the active run so Dashboard's "Continue
  // Simulation" button knows what to resume, and doesn't offer to resume a
  // run that's already finished.
  useEffect(() => {
    if (!simState) return
    if (simState.status === 'completed') {
      localStorage.removeItem(ACTIVE_RUN_ID_KEY)
      localStorage.removeItem(ACTIVE_RUN_CAREER_KEY)
    } else {
      localStorage.setItem(ACTIVE_RUN_ID_KEY, simState.runId)
      localStorage.setItem(ACTIVE_RUN_CAREER_KEY, simState.careerTitle)
    }
  }, [simState])

  // Hold the intro loader for a minimum beat once real scenario data has
  // arrived (whether from router state or the resume fetch), then fade it
  // out — instead of it just popping out of the way the instant data
  // happens to be ready. Only runs for the very first reveal: once
  // showIntroLoader flips false it stays false through later moments,
  // which fade via the separate black in/out transition instead.
  useEffect(() => {
    if (!simState || !showIntroLoader) return undefined
    const revealTimer = setTimeout(() => {
      setIntroLoaderHiding(true)
      setTimeout(() => setShowIntroLoader(false), INTRO_LOADER_FADE_MS)
    }, INTRO_LOADER_MIN_MS)
    return () => clearTimeout(revealTimer)
  }, [simState, showIntroLoader])

  // Once the intro loader is gone, wait a beat before the dialogue box
  // itself appears — it shouldn't just be sitting there revealed the
  // instant the loader clears. showIntroLoader only ever goes true -> false
  // once, so this (and the reveal effect below it) only fires for the very
  // first scenario; later moments already get their own reveal via the
  // black in/out transition.
  useEffect(() => {
    if (showIntroLoader) return undefined
    const timer = setTimeout(() => setShowDialogueBox(true), DIALOGUE_BOX_DELAY_MS)
    return () => clearTimeout(timer)
  }, [showIntroLoader])

  // Only start the dialogue's typing animation once the box has finished
  // animating into place, not while it's still sliding/fading in.
  useEffect(() => {
    if (!showDialogueBox) return undefined
    const timer = setTimeout(() => setDialogueBoxRevealed(true), DIALOGUE_BOX_ENTRANCE_MS)
    return () => clearTimeout(timer)
  }, [showDialogueBox])

  function completeTyping() {
    if (!currentChunk) return
    clearTimeout(typingTimeoutRef.current)
    setDisplayedText(currentChunk.text || '')
    setIsTyping(false)
  }

  // The keyboard-typing loop just follows isTyping — a separate effect
  // instead of touching the typing state machine above, so it can't affect
  // its timing. Music ducks at the same time so the typing sound reads
  // clearly over it instead of the two competing.
  useEffect(() => {
    setMusicDucking(isTyping)
    if (isTyping) {
      startLoopingSfx('typing', SFX.keyboardTyping)
    } else {
      stopLoopingSfx('typing')
    }
    return () => {
      stopLoopingSfx('typing')
      setMusicDucking(false)
    }
  }, [isTyping])

  function stopReflectionPolling() {
    if (reflectionPollRef.current) {
      clearTimeout(reflectionPollRef.current)
      reflectionPollRef.current = null
    }
  }

  // Poll the run until the backend has saved its AI reflection (generation
  // started when the final choice was submitted, so it's usually already
  // done by the time the player clicks "Get Reflection"). Falls back to the
  // synchronous regenerate endpoint if it's taking too long, and errors out
  // past a hard ceiling rather than polling forever.
  function startReflectionPolling(runId) {
    stopReflectionPolling()
    setReflectionError(null)
    setCompletionPhase('loading')

    const startedAt = Date.now()
    let fallbackFired = false

    async function tick() {
      try {
        const res = await fetch(`${SIMULATION_API_BASE}/${runId}`, {
          headers: authHeaders(),
        })
        if (res.status === 401 || res.status === 403) {
          logout()
          navigate('/login', { state: { sessionExpired: true } })
          return
        }
        if (!res.ok) throw new Error(`reflection fetch failed with status ${res.status}`)
        const data = await res.json()

        if (data.aiReflection) {
          stopReflectionPolling()
          // Hand the finished reflection + trait totals to the Reflection
          // page via router state so it never has to re-fetch.
          navigate('/reflection', {
            state: {
              careerTitle: data.careerTitle,
              aiReflection: data.aiReflection,
              accumulatedScores: data.accumulatedScores,
              runId: data.runId,
            },
          })
          return
        }

        const elapsed = Date.now() - startedAt
        if (elapsed > REFLECTION_HARD_TIMEOUT_MS) {
          stopReflectionPolling()
          setReflectionError('Your reflection is taking longer than expected.')
          setCompletionPhase('error')
          return
        }
        if (!fallbackFired && elapsed > REFLECTION_FALLBACK_MS) {
          fallbackFired = true
          // Nudge the backend to (re)start generation once, in case the job
          // died; it returns immediately and the next poll picks up the result.
          // The backend de-dupes. Fired only once — repeated nudges on a slow
          // connection just burn Gemini requests.
          fetch(`${SIMULATION_API_BASE}/${runId}/regenerate-reflection`, {
            method: 'POST',
            headers: authHeaders(),
          }).catch(() => {})
        }
        reflectionPollRef.current = setTimeout(tick, REFLECTION_POLL_INTERVAL_MS)
      } catch (err) {
        console.error(err)
        stopReflectionPolling()
        setReflectionError(err.message || 'Something went wrong while preparing your reflection.')
        setCompletionPhase('error')
      }
    }

    tick()
  }

  // Clear any pending poll timer if the page unmounts mid-wait.
  useEffect(() => {
    return () => {
      if (reflectionPollRef.current) clearTimeout(reflectionPollRef.current)
    }
  }, [])

  function applyScenario(data) {
    setSimState(data)
    setChunkIndex(0)
    // A completed run's final response re-sends the same ending scenario
    // (just with status flipped) since there's no next scenario to move
    // to — the player already watched this dialogue and made their choice,
    // so skip straight past it to the reflection loading screen instead of
    // replaying it.
    setAllChunksShown(data.status === 'completed')
    setChoicesReady(false)
    setSelectedOptionKey(null)
    setClickSequence([])
    setScenarioLoadedAt(null)
    setRealityText(null)
    setPendingNextState(null)
    setIsSubmitting(false)
    setReflectionError(null)
    stopReflectionPolling()
    // Back to the default wait state — the completed-run overlay shows the
    // static "What You Experienced" screen until the player taps "Get
    // Reflection", which starts polling.
    setCompletionPhase(null)
  }

  // Swaps to the next moment behind a full-screen black fade: fade to
  // black, swap the scene while the screen is fully black (so the swap
  // itself is never visible), then fade back in on the new moment.
  function transitionToScenario(data) {
    setIsBlackout(true)
    setTimeout(() => {
      applyScenario(data)
      setIsBlackout(false)
    }, MOMENT_FADE_MS + MOMENT_BLACK_HOLD_MS)
  }

  async function handleOptionClick(event) {
    const optionKey = event.currentTarget.dataset.optionKey
    const choice = (simState.choices || []).find((c) => c.optionKey === optionKey)
    if (!choice || isSubmitting) return

    const nextSequence = [...clickSequence, choice.optionKey]
    setClickSequence(nextSequence)

    if (selectedOptionKey !== choice.optionKey) {
      setSelectedOptionKey(choice.optionKey)
      return
    }

    setIsSubmitting(true)
    const choiceSubmittedAt = Date.now()
    try {
      const res = await fetch(`${SIMULATION_API_BASE}/${simState.runId}/choice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          choiceId: choice.choiceId,
          scenarioLoadedAt,
          choiceSubmittedAt,
          clickSequence: nextSequence,
        }),
      })
      if (res.status === 401 || res.status === 403) {
        logout()
        navigate('/login', { state: { sessionExpired: true } })
        return
      }
      if (!res.ok) throw new Error(`choice submit failed with status ${res.status}`)
      const data = await res.json()
      setPendingNextState(data)
      if (data.lastRealityText) {
        // isSubmitting flips true (and the choice list starts fading out) the
        // moment the click is confirmed, so time the reveal from the click
        // rather than from the response — that way the fade-out always has
        // room to finish before the reality reveal begins, however fast or
        // slow the request itself was.
        const targetDelay = CHOICE_FADE_OUT_MS + 700 + Math.random() * 300
        const elapsed = Date.now() - choiceSubmittedAt
        const remaining = Math.max(0, targetDelay - elapsed)
        setTimeout(() => setRealityText(data.lastRealityText), remaining)
      } else {
        transitionToScenario(data)
      }
    } catch (err) {
      console.error(err)
      setIsSubmitting(false)
      setSelectedOptionKey(null)
    }
  }

  function handleRealityNext() {
    if (pendingNextState) {
      // Leave the modal mounted through the fade-to-black — applyScenario
      // (run once the screen is fully black) clears realityText for us, so
      // the modal never just vanishes mid-transition.
      transitionToScenario(pendingNextState)
    } else {
      setRealityText(null)
    }
  }

  // Holds the choice box back until any character portrait still on screen
  // has had time to fade out (see the character-visibility effect above,
  // which starts that fade the moment allChunksShown flips true) — instead
  // of the choices popping in at full opacity while she's mid-fade.
  function revealChoicesOnceCharacterFades() {
    const delay = currentChunk?.characterImage ? CHOICE_FADE_OUT_MS : 0
    setTimeout(() => setChoicesReady(true), delay)
  }

  // Scenarios with no dialogue at all skip straight to choices/ending.
  useEffect(() => {
    if (!simState || chunks.length !== 0) return undefined
    const id = setTimeout(() => {
      setAllChunksShown(true)
      setScenarioLoadedAt(Date.now())
      revealChoicesOnceCharacterFades()
    }, 0)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simState, chunks.length])

  useEffect(() => {
    if (!currentChunk || showIntroLoader || !dialogueBoxRevealed) return undefined

    const fullText = currentChunk.text || ''
    // Fixed rate for every line. Previously charsPerTick was scaled up from
    // the chunk's own length to keep total typing time under a ceiling,
    // which made longer lines type faster than short ones — so a career
    // with wordier dialogue felt paced differently. Impatient players have
    // Skip >> / Enter to jump to the full text.
    const charsPerTick = TYPE_CHARS_PER_TICK

    let shown = 0

    const tick = () => {
      shown = Math.min(fullText.length, shown + charsPerTick)
      setDisplayedText(fullText.slice(0, shown))
      if (shown >= fullText.length) {
        setIsTyping(false)
        return
      }
      typingTimeoutRef.current = setTimeout(tick, TYPE_INTERVAL_MS)
    }

    typingTimeoutRef.current = setTimeout(() => {
      setDisplayedText('')
      setIsTyping(true)
      typingTimeoutRef.current = setTimeout(tick, TYPE_INTERVAL_MS)
    }, 0)

    return () => clearTimeout(typingTimeoutRef.current)
    // currentChunk is derived from [chunkIndex, simState]; including it would be redundant.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chunkIndex, simState, showIntroLoader, dialogueBoxRevealed])

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key !== 'Enter') return
      if (allChunksShown || leaveModalOpen || audioModalOpen || realityText) return
      event.preventDefault()
      // First press finishes the typewriter animation instantly, matching
      // "Skip >>"; a second press (line already fully shown) advances to the
      // next chunk or reveals the choices — the same two-stage behaviour
      // clicking the dialogue box already gives.
      if (isTyping) {
        completeTyping()
      } else {
        handleDialogueClick()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTyping, currentChunk, allChunksShown, leaveModalOpen, audioModalOpen, realityText])

  function handleDialogueClick() {
    if (isTyping || !currentChunk) return
    if (chunkIndex < chunks.length - 1) {
      setChunkIndex((i) => i + 1)
    } else if (!allChunksShown) {
      setAllChunksShown(true)
      setScenarioLoadedAt(Date.now())
      revealChoicesOnceCharacterFades()
    }
  }

  if (loadError) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center gap-4 bg-[#14102b] text-[#f2e9dc] font-sans px-4 text-center">
        <p className="text-lg">Couldn&apos;t load this simulation.</p>
        <p className="text-sm text-[#f2e9dc]/60">{loadError}</p>
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="mt-2 px-8 py-3 rounded-full text-sm font-medium"
          style={{ backgroundColor: '#d9a94f', color: '#14102b' }}
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  if (!simState) {
    return <LoadingScreen />
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#14102b] text-[#f2e9dc] font-sans">
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
        style={{ backgroundImage: `url(${simState.backgroundImageUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#14102b] via-[#14102b]/10 to-[#14102b]/40" />

      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between gap-4 px-6 py-4 bg-gradient-to-b from-[#14102b]/85 to-transparent">
        {momentNumber > 0 ? (
          <div className="px-4 py-1.5 rounded-full bg-[#14102b]/60 border border-[#6b4d94]/40 text-sm font-medium text-[#f2e9dc]/90 backdrop-blur">
            Moment {momentNumber} / {TOTAL_MOMENTS}
          </div>
        ) : (
          <div />
        )}

        <div className="font-serif text-lg text-[#d9a94f] tracking-wide truncate">
          {simState.careerTitle}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setAudioModalOpen(true)}
            aria-label="Audio settings"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#14102b]/60 border border-[#6b4d94]/40 text-[#f2e9dc] hover:text-[#d9a94f] hover:bg-[#6b4d94]/20 transition-colors backdrop-blur"
          >
            <Volume2 className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setLeaveModalOpen(true)}
            aria-label="Exit simulation"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#14102b]/60 border border-[#6b4d94]/40 text-[#f2e9dc] hover:text-[#d9a94f] hover:bg-[#6b4d94]/20 transition-colors backdrop-blur"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {displayedCharacter && (
        <img
          src={displayedCharacter.src}
          alt={displayedCharacter.alt}
          className={`absolute bottom-[16%] h-[70%] max-h-[680px] object-contain drop-shadow-2xl select-none pointer-events-none transition-opacity ease-out ${
            characterVisible && !isSubmitting ? 'opacity-100' : 'opacity-0'
          } ${
            // Mirrors the dialogue box's own horizontal inset (w-[92%]
            // max-w-4xl, centered) so the character's outer edge never
            // sits past where the box actually reaches: 4% on narrow
            // screens where the box is width-constrained by the 92%, but
            // pinned to the box's real edge once max-w-4xl (56rem) caps
            // it on wide screens, instead of drifting out toward the
            // viewport edge and exposing whatever the box doesn't cover.
            displayedCharacter.side === 'left'
              ? 'left-[max(4%,calc(50%_-_28rem))]'
              : 'right-[max(4%,calc(50%_-_28rem))]'
          }`}
          style={{ transitionDuration: `${CHOICE_FADE_OUT_MS}ms` }}
        />
      )}

      {!allChunksShown && currentChunk?.phone && (
        <PhoneCallOverlay name={currentChunk.speaker} />
      )}

      {!allChunksShown && currentChunk && (
        <div
          onClick={handleDialogueClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            // Enter is handled globally above (works regardless of focus,
            // and covers finish-typing + advance in one place) — handling it
            // here too would double-advance whenever this box has focus.
            if (e.key === ' ') handleDialogueClick()
          }}
          className={`absolute bottom-0 left-0 right-0 z-20 mx-auto mb-8 w-[92%] max-w-4xl cursor-pointer rounded-3xl border border-[#6b4d94]/40 p-6 transition-all ease-out ${
            showDialogueBox ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
          style={{
            background: 'rgba(20, 16, 43, 0.55)',
            backdropFilter: 'blur(16px)',
            transitionDuration: `${DIALOGUE_BOX_ENTRANCE_MS}ms`,
          }}
        >
          {currentChunk.speaker && currentChunk.speaker !== 'Narrator' && (
            <div className="font-serif text-lg text-[#d9a94f] mb-2 flex items-center gap-2">
              {currentChunk.phone && (
                <Phone className="animate-call-wobble h-4 w-4" fill="currentColor" />
              )}
              {currentChunk.speaker}
              {currentChunk.phone && (
                <span className="text-xs font-sans uppercase tracking-[0.2em] text-[#f2e9dc]/45">
                  on the phone
                </span>
              )}
            </div>
          )}
          <p className="min-h-[3.5em] whitespace-pre-line text-base leading-relaxed text-[#f2e9dc]">
            {displayedText}
          </p>
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                completeTyping()
              }}
              className="text-sm text-[#f2e9dc]/60 hover:text-[#d9a94f] transition-colors"
            >
              Skip &gt;&gt;
            </button>
          </div>
        </div>
      )}

      {allChunksShown && choicesReady && simState.status !== 'completed' && (
        <div
          className={`absolute bottom-0 left-0 right-0 z-20 mx-auto flex w-[92%] max-w-2xl flex-col gap-3 transition-opacity ease-out ${
            (simState.choices || []).length === 1 ? 'mb-16' : 'mb-8'
          } ${
            isSubmitting ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
          style={{ transitionDuration: `${CHOICE_FADE_OUT_MS}ms` }}
        >
          {(simState.choices || []).map((choice) => {
            const isSelected = selectedOptionKey === choice.optionKey
            return (
              <button
                key={choice.choiceId}
                type="button"
                data-option-key={choice.optionKey}
                disabled={isSubmitting}
                onClick={handleOptionClick}
                className={`rounded-2xl border px-6 py-4 text-left backdrop-blur transition-all duration-200 disabled:opacity-60 ${
                  isSelected
                    ? 'border-[#d9a94f] bg-[#14102b]/85 shadow-[0_0_26px_rgba(217,169,79,0.55)]'
                    : 'border-[#6b4d94] bg-[#14102b]/85 hover:border-[#8a6bb3] hover:bg-[#14102b]/95 hover:shadow-[0_0_20px_rgba(217,169,79,0.3)]'
                }`}
              >
                <span className="mr-2 font-semibold text-[#d9a94f]">{choice.optionKey}.</span>
                <span className="text-[#f2e9dc]">{choice.text}</span>
                {isSelected && (
                  <span className="mt-1 block text-xs text-[#d9a94f]/80">
                    Click again to confirm
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {allChunksShown &&
        simState.status === 'completed' &&
        completionPhase !== 'loading' &&
        completionPhase !== 'error' && (
          <ExperiencedScreen
            careerTitle={simState.careerTitle}
            onContinue={() => startReflectionPolling(simState.runId)}
          />
        )}

      {allChunksShown && simState.status === 'completed' && completionPhase === 'error' && (
        <div
          className="fixed inset-0 z-[90] flex flex-col items-center justify-center gap-5 backdrop-blur-sm px-6 text-center"
          style={{ backgroundColor: 'rgba(15, 9, 31, 0.85)' }}
        >
          <p className="font-serif text-lg text-[#f2e9dc]/90 max-w-sm">
            Something went wrong while preparing your reflection.
          </p>
          <p className="text-sm text-[#f2e9dc]/60 max-w-sm">{reflectionError}</p>
          <button
            type="button"
            onClick={() => startReflectionPolling(simState.runId)}
            className="px-8 py-3 rounded-full text-sm font-medium tracking-wide transition-transform duration-150 ease-out active:scale-95"
            style={{ backgroundColor: '#d9a94f', color: '#14102b' }}
          >
            Try Again
          </button>
        </div>
      )}

      {allChunksShown && simState.status === 'completed' && completionPhase === 'loading' && (
        <LoadingScreen text="Your reflection is being prepared..." />
      )}

      {realityText && <RealityModal text={realityText} onNext={handleRealityNext} />}

      {leaveModalOpen && (
        <LeaveSimulationModal
          onContinue={() => setLeaveModalOpen(false)}
          onExit={() => navigate('/dashboard')}
        />
      )}

      {audioModalOpen && (
        <AudioModal
          onClose={() => setAudioModalOpen(false)}
          musicEnabled={musicEnabled}
          sfxEnabled={sfxEnabled}
          volume={volume}
          onMusicChange={setMusicEnabled}
          onSfxChange={setSfxEnabled}
          onVolumeChange={setVolume}
        />
      )}

      <div
        aria-hidden="true"
        className={`fixed inset-0 z-[80] bg-black transition-opacity ease-in-out ${
          isBlackout ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ transitionDuration: `${MOMENT_FADE_MS}ms` }}
      />

      {showIntroLoader && <LoadingScreen hide={introLoaderHiding} />}
    </div>
  )
}

export default Simulation
