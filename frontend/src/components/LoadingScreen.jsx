import loadingSprite from '../assets/loading_sparkle_sprite.png'

// loading_sparkle_sprite.png is the source loading_animation.jpg with its
// navy background chroma-keyed out to real alpha transparency, so the
// sparkle sits cleanly on top of any overlay color/opacity below without
// dragging a visible background box along with it.
const OVERLAY_BG_COLOR = 'rgba(15, 9, 31, 0.85)'

// The sheet is a 5x2 grid of ~125x177px cells (portrait) — size the
// display box to that same ratio so background-size: 500% 200% maps
// 1:1 with no stretching or clipping.
const SPRITE_BOX_WIDTH = 128
const SPRITE_BOX_HEIGHT = 181

// Deliberately at full intended opacity from the first paint, with no
// entrance fade: this overlay's whole job is to cover whatever's mounting
// underneath it (a scene that's often already fully rendered by the time
// we appear), so fading itself in would let that content flash through
// unevenly during the fade. Only the exit (via `hide`) animates, once
// there's actually something ready to reveal.
function LoadingScreen({
  text = 'For the next few minutes, this is your career.',
  hide = false,
}) {
  return (
    <div
      className={`fixed inset-0 z-[90] flex flex-col items-center justify-center gap-6 backdrop-blur-sm transition-opacity duration-500 ease-in-out ${
        hide ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
      }`}
      style={{ backgroundColor: OVERLAY_BG_COLOR }}
    >
      <div
        className="animate-sprite-loading"
        style={{
          width: SPRITE_BOX_WIDTH,
          height: SPRITE_BOX_HEIGHT,
          backgroundImage: `url(${loadingSprite})`,
        }}
        role="img"
        aria-label="Loading"
      />
      <p className="font-serif text-lg text-[#f2e9dc]/90 tracking-wide text-center px-6 max-w-sm">
        {text}
      </p>
    </div>
  )
}

export default LoadingScreen
