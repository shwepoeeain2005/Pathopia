import { useEffect, useState } from 'react'

// Single source of truth for Music/Sound Effects/Volume, shared between the
// navbar's Settings dialog and the Simulation page's Sound Settings popup —
// previously each kept its own separate, unsynced state. Persisted to
// localStorage (module-level, not React state) with a tiny pub/sub so every
// mounted useAudioSettings() instance on the page updates immediately when
// any one of them changes a setting, not just on next reload.
const STORAGE_KEY = 'pathopia.audioSettings'
const DEFAULTS = { musicEnabled: true, sfxEnabled: true, volume: 75 }

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULTS
    return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {
    return DEFAULTS
  }
}

let settings = loadSettings()
const listeners = new Set()

function updateSettings(patch) {
  settings = { ...settings, ...patch }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // Private browsing / storage disabled — setting still works for this
    // session via the in-memory value, just won't persist across reloads.
  }
  listeners.forEach((listener) => listener(settings))
}

export function useAudioSettings() {
  const [current, setCurrent] = useState(settings)

  useEffect(() => {
    listeners.add(setCurrent)
    return () => listeners.delete(setCurrent)
  }, [])

  return {
    musicEnabled: current.musicEnabled,
    sfxEnabled: current.sfxEnabled,
    volume: current.volume,
    setMusicEnabled: (musicEnabled) => updateSettings({ musicEnabled }),
    setSfxEnabled: (sfxEnabled) => updateSettings({ sfxEnabled }),
    setVolume: (volume) => updateSettings({ volume }),
  }
}

// Non-hook accessors for audioEngine.js, which is a plain module (not a
// component) and needs to read/react to the same settings without being
// able to call a hook.
export function getAudioSettings() {
  return settings
}

export function subscribeAudioSettings(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
