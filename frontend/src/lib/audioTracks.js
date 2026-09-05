// Central manifest of every audio asset in
// public/assets/audio_and_sound_effect/, so no other file hardcodes a path.
// Files are served straight from /public, so these are plain absolute URLs.
const BASE = '/assets/audio_and_sound_effect'

// Looping background beds.
export const MUSIC = {
  // Public marketing pages (Landing, About when logged out, Login/Register).
  unlockingTheMoon: `${BASE}/unlocking-the-moon.wav`,
  // Logged-in app shell (Dashboard, Career Selection, History, About when
  // logged in) and the Reflection results page.
  gentleness: `${BASE}/gentleness.ogg`,
  // In-simulation mood beds. Picked by filename/title only — nothing in
  // this codebase has actually listened to confirm tone.
  blithe: `${BASE}/blithe.ogg`, // scene 0 / onboarding — light, upbeat
  everydayLife: `${BASE}/everyday-life.wav`, // routine workday, low stakes
  crystalBlue: `${BASE}/crystal-blue.ogg`, // cool, analytical, working a problem
  blackMonolith: `${BASE}/black-monolith.ogg`, // serious, ominous — real conflict
  tension: `${BASE}/tension.mp3`, // acute pressure — a deadline, a crisis, a room watching
  awe: `${BASE}/awe.ogg`, // a big reveal or a career-ending's final beat
  relax: `${BASE}/relax.wav`, // spare: a low-pressure/downtime bed, unused
  // for now — a candidate for a future flagged breaktime scenario.
  officeAmbience: `${BASE}/office-ambience.mp3`, // replaces mood music for a
  // scenario when a chunk sets `ambience: "office"`.
}

// Maps a scenario's `mood` field (set on that scenario's first dialogue
// chunk, in Neon — every scenario across all four careers has one, assigned
// by actually reading its dialogue) to the track that plays for it. Falls
// back to the moment-number heuristic (pickSceneTrack in audioEngine.js)
// only if a scenario is ever missing one.
export const MOOD_TRACKS = {
  blithe: MUSIC.blithe,
  'everyday-life': MUSIC.everydayLife,
  'crystal-blue': MUSIC.crystalBlue,
  'black-monolith': MUSIC.blackMonolith,
  tension: MUSIC.tension,
  awe: MUSIC.awe,
  relax: MUSIC.relax,
}

// One-shot sound effects.
export const SFX = {
  clickButton: `${BASE}/click-button.mp3`,
  decline: `${BASE}/decline.wav`, // X / close / cancel
  synthWarning: `${BASE}/synth-warning.wav`, // conflict modal appears
  pianoJingle: `${BASE}/piano-jingle.wav`, // Reality box + Reflection page appear
  phoneRinging: `${BASE}/phone-ringing.mp3`, // dialogue chunk flagged phone: true
  doorSlam: `${BASE}/door-slam.mp3`, // dialogue chunk flagged sfx: "door-slam"
  heartbeat: `${BASE}/heartbeat.mp3`, // dialogue chunk flagged sfx: "heartbeat"
  walkingMen: `${BASE}/walking-men.mp3`, // dialogue chunk flagged sfx: "walk-men"
  walkingHeels: `${BASE}/walking-heels.mp3`, // dialogue chunk flagged sfx: "walk-heels"
  keyboardTyping: `${BASE}/keyboard-typing.mp3`, // looped while dialogue is typing
}

// Maps a dialogue chunk's optional `sfx` field to a one-shot effect — the
// same idea as `phone: true`. A handful of scenarios' Neon content sets
// this already (a door slam, footsteps approaching); `heartbeat` and
// `walk-men` are wired but not yet used by any scenario.
export const CHUNK_SFX = {
  'door-slam': SFX.doorSlam,
  heartbeat: SFX.heartbeat,
  'walk-men': SFX.walkingMen,
  'walk-heels': SFX.walkingHeels,
}
