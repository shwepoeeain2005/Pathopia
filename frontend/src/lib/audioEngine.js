// A plain (non-React) singleton audio player, so background music can
// survive route changes without remounting, and any component can fire a
// one-shot sound effect without owning its own <audio> element. Reacts live
// to the same Music/SFX/Volume settings the app's audio UI already exposes.
import { getAudioSettings, subscribeAudioSettings } from '../hooks/useAudioSettings.js'
import { MUSIC, MOOD_TRACKS } from './audioTracks.js'

const FADE_MS = 900
const FADE_STEP_MS = 40

function clamp01(n) {
  return Math.min(1, Math.max(0, n))
}

function effectiveVolume() {
  return clamp01(getAudioSettings().volume / 100)
}

// Music "ducks" (quiets down) while dialogue is typing, so the typing sound
// reads clearly over it instead of the two fighting for attention. 1 =
// normal, lower = quieter.
let musicDuckFactor = 1

function musicTargetVolume() {
  return effectiveVolume() * musicDuckFactor
}

export function setMusicDucking(active) {
  musicDuckFactor = active ? 0.35 : 1
  if (currentMusic && getAudioSettings().musicEnabled) {
    fadeTo(currentMusic.audio, musicTargetVolume())
  }
}

// Browsers block audio.play() before any real user gesture on the page —
// the very first thing that tries to autoplay (the public-page music) will
// usually get rejected. Queue it and retry once on the next click/keydown
// anywhere, instead of just staying silent forever.
let pendingResumes = []
let resumeArmed = false

function armResumeListener() {
  if (resumeArmed) return
  resumeArmed = true
  const handler = () => {
    resumeArmed = false
    window.removeEventListener('pointerdown', handler)
    window.removeEventListener('keydown', handler)
    const toRetry = pendingResumes
    pendingResumes = []
    toRetry.forEach((fn) => fn())
  }
  window.addEventListener('pointerdown', handler, { once: true })
  window.addEventListener('keydown', handler, { once: true })
}

function tryPlay(audio) {
  const playPromise = audio.play()
  if (playPromise && typeof playPromise.catch === 'function') {
    playPromise.catch(() => {
      pendingResumes.push(() => audio.play().catch(() => {}))
      armResumeListener()
    })
  }
}

function fadeTo(audio, target, onDone) {
  const steps = Math.max(1, Math.round(FADE_MS / FADE_STEP_MS))
  const start = audio.volume
  const delta = (target - start) / steps
  let i = 0
  const timer = setInterval(() => {
    i += 1
    audio.volume = clamp01(start + delta * i)
    if (i >= steps) {
      clearInterval(timer)
      audio.volume = clamp01(target)
      onDone?.()
    }
  }, FADE_STEP_MS)
}

// --- Background music: one track at a time, crossfaded ---------------------

let currentMusic = null // { src, audio }

export function playMusic(src, { loop = true } = {}) {
  if (!src) return

  // Same track already playing (e.g. still on a public page) — left alone
  // so it plays through uninterrupted rather than jumping back to 0:00.
  if (currentMusic?.src === src) return

  const outgoing = currentMusic
  const audio = new Audio(src)
  audio.loop = loop
  audio.volume = 0
  currentMusic = { src, audio }

  if (getAudioSettings().musicEnabled) {
    tryPlay(audio)
    fadeTo(audio, musicTargetVolume())
  }

  if (outgoing) {
    fadeTo(outgoing.audio, 0, () => {
      outgoing.audio.pause()
      outgoing.audio.src = ''
    })
  }
}

export function stopMusic() {
  if (!currentMusic) return
  const outgoing = currentMusic
  currentMusic = null
  fadeTo(outgoing.audio, 0, () => {
    outgoing.audio.pause()
    outgoing.audio.src = ''
  })
}

// Fallback only — used if a scenario is ever missing a `mood` (every
// scenario across all four careers has one as of this writing). Keyed off
// the same "Moment N / 8" counter already on screen, so at least gives a
// reasonable calm -> tense arc rather than nothing.
export function pickSceneTrack(momentNumber, status) {
  if (status === 'completed') return MUSIC.gentleness
  if (!momentNumber || momentNumber <= 0) return MUSIC.blithe // scene 0 / onboarding
  if (momentNumber <= 2) return MUSIC.everydayLife
  if (momentNumber <= 4) return MUSIC.crystalBlue
  if (momentNumber <= 6) return MUSIC.blackMonolith
  if (momentNumber === 7) return MUSIC.tension
  return MUSIC.awe // moment 8, the finale
}

// The real, situational pick: each scenario's `mood` (set on its dialogue
// chunks in Neon, assigned by reading what's actually happening in that
// scene) beats the generic moment-number guess above. `status ===
// 'completed'` always wins — the run's just-finished resolution beat, not
// whatever the last scenario's own mood was.
export function pickMoodTrack(chunks, momentNumber, status) {
  if (status === 'completed') return MUSIC.gentleness
  const mood = chunks.find((chunk) => chunk.mood)?.mood
  return (mood && MOOD_TRACKS[mood]) || pickSceneTrack(momentNumber, status)
}

// --- One-shot sound effects --------------------------------------------

// `level` boosts (or cuts) a specific one-shot above the normal volume —
// e.g. footsteps need to read clearly over a scene, so they get played
// louder than the default.
export function playSfx(src, { level = 1 } = {}) {
  if (!src || !getAudioSettings().sfxEnabled) return
  const audio = new Audio(src)
  audio.volume = clamp01(effectiveVolume() * level)
  tryPlay(audio)
}

// --- Loopable sound effects (currently just the typing sound) ----------

// Full relative volume — was scaled down (0.5, then 0.85) to sit under the
// music, but that just made it hard to hear; let it play at the same level
// as everything else and use the Master Volume slider to balance overall.
const LOOPING_SFX_LEVEL = 1

const loopingSfx = new Map()

export function startLoopingSfx(key, src) {
  if (!getAudioSettings().sfxEnabled || loopingSfx.has(key)) return
  const audio = new Audio(src)
  audio.loop = true
  audio.volume = effectiveVolume() * LOOPING_SFX_LEVEL
  loopingSfx.set(key, audio)
  tryPlay(audio)
}

export function stopLoopingSfx(key) {
  const audio = loopingSfx.get(key)
  if (!audio) return
  audio.pause()
  audio.src = ''
  loopingSfx.delete(key)
}

// Keep whatever's already playing in sync with live setting changes —
// muting the instant Music/SFX is switched off, and resuming (at the
// current volume) the instant it's switched back on.
subscribeAudioSettings((settings) => {
  if (currentMusic) {
    if (!settings.musicEnabled) {
      currentMusic.audio.pause()
    } else {
      currentMusic.audio.volume = musicTargetVolume()
      if (currentMusic.audio.paused) tryPlay(currentMusic.audio)
    }
  }

  loopingSfx.forEach((audio) => {
    if (!settings.sfxEnabled) {
      audio.pause()
    } else {
      audio.volume = effectiveVolume() * LOOPING_SFX_LEVEL
      if (audio.paused) tryPlay(audio)
    }
  })
})
