import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { playMusic, playSfx } from '../lib/audioEngine.js'
import { MUSIC, SFX } from '../lib/audioTracks.js'

// Routes with their own moment-by-moment music (Simulation drives
// audioEngine directly) — the route-based default below must stay out of
// their way entirely.
const SELF_MANAGED_PREFIXES = ['/simulation']

// Always the public track, regardless of whether a stale auth token is
// still sitting in localStorage — these pages are reachable logged in or
// out (e.g. revisiting "/" or "/login" without logging out first), and
// must never pick up the private-page music just because a token exists.
const ALWAYS_PUBLIC_PATHS = ['/', '/login', '/register']

/**
 * Mounted once, above the router, so background music persists across
 * navigation instead of restarting every time a private page remounts —
 * Landing -> Login/Register is still the same public track playing through
 * uninterrupted, same as any other public-to-public navigation.
 * Also owns one delegated click listener for the generic UI click sound,
 * everywhere in the app (buttons and links alike), without each one
 * needing its own handler.
 */
function AudioProvider({ children }) {
  const location = useLocation()

  useEffect(() => {
    const path = location.pathname
    if (SELF_MANAGED_PREFIXES.some((prefix) => path.startsWith(prefix))) return

    const isLoggedIn = Boolean(localStorage.getItem('authToken'))
    const isPublicPage = ALWAYS_PUBLIC_PATHS.includes(path) || !isLoggedIn
    playMusic(isPublicPage ? MUSIC.unlockingTheMoon : MUSIC.gentleness)
  }, [location.pathname])

  useEffect(() => {
    function handleClick(event) {
      // `a[href]` catches nav links (PrivateNavbar's Dashboard/Career
      // Selection/History/About are plain <a> tags via NavLink, not
      // <button>, so they were silent without this).
      const target = event.target.closest('button, [role="button"], a[href]')
      if (!target || target.disabled) return
      const override = target.getAttribute('data-sfx')
      playSfx(override && SFX[override] ? SFX[override] : SFX.clickButton)
    }
    // Capture phase: fires even if the button's own handler stops
    // propagation later in the bubble phase.
    window.addEventListener('click', handleClick, true)
    return () => window.removeEventListener('click', handleClick, true)
  }, [])

  return children
}

export default AudioProvider
