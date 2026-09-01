import { Phone } from 'lucide-react'

// Shown in place of a character portrait when a dialogue chunk is flagged
// `phone: true` — the speaker is on a call, not physically in the scene.
// The expanding rings + ringing handset make it obvious this is a phone
// call rather than someone standing off-screen.
function PhoneCallOverlay({ name }) {
  return (
    <div className="pointer-events-none absolute left-1/2 top-[24%] z-10 flex -translate-x-1/2 flex-col items-center select-none">
      <div className="relative flex h-28 w-28 items-center justify-center">
        {[0, 0.6, 1.2].map((delay) => (
          <span
            key={delay}
            className="animate-call-ring absolute inset-0 rounded-full border border-[#d9a94f]/60"
            style={{ animationDelay: `${delay}s` }}
          />
        ))}
        <div
          className="relative flex h-24 w-24 items-center justify-center rounded-full border border-[#d9a94f]/40 shadow-[0_0_45px_rgba(217,169,79,0.35)]"
          style={{ background: 'linear-gradient(150deg, #2d2154, #6b4d94)' }}
        >
          <Phone className="animate-call-wobble h-9 w-9 text-[#d9a94f]" fill="currentColor" />
        </div>
      </div>

      <div className="mt-5 flex flex-col items-center gap-1 text-center">
        <span className="text-xs uppercase tracking-[0.3em] text-[#f2e9dc]/50">
          Incoming call
        </span>
        {name && <span className="font-serif text-xl text-[#d9a94f]">{name}</span>}
      </div>
    </div>
  )
}

export default PhoneCallOverlay
