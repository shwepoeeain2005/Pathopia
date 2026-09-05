import { useEffect, useLayoutEffect, useRef } from 'react'
import { X } from 'lucide-react'
import './CareerBriefingModal.css'

/**
 * Shown after the user picks an available career and before the run starts.
 * When `originRect` (the clicked card's career-image box) is given, that same
 * image morphs from the grid into the briefing card's art slot via a FLIP
 * transition, while the card itself fades in behind it.
 */
function CareerBriefingModal({ career, originRect, onContinue, onClose }) {
  const artRef = useRef(null)

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  // Shared-element move: the career image starts exactly where it sat on the
  // grid card and glides (900ms) to its place in the briefing card, so the
  // movement between the two cards is plainly visible.
  useLayoutEffect(() => {
    const wrap = artRef.current
    if (!wrap || !originRect) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const img = wrap.querySelector('.briefing-card__art-img') || wrap
    const to = img.getBoundingClientRect()
    if (!to.width) return

    const dx =
      originRect.left + originRect.width / 2 - (to.left + to.width / 2)
    const dy = originRect.top + originRect.height / 2 - (to.top + to.height / 2)
    const scale = originRect.width / to.width || 1

    const anim = wrap.animate(
      [
        { transform: `translate(${dx}px, ${dy}px) scale(${scale})` },
        { transform: 'translate(0px, 0px) scale(1)' },
      ],
      { duration: 900, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)', fill: 'both' },
    )

    const done = () => {
      try {
        anim.cancel()
      } catch {
        /* animation already gone */
      }
    }
    anim.addEventListener('finish', done)

    return () => {
      anim.removeEventListener('finish', done)
      done()
    }
  }, [originRect])

  return (
    <div
      className="briefing-overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        className={originRect ? 'briefing-card' : 'briefing-card briefing-card--pop'}
        data-color={career.color}
        role="dialog"
        aria-modal="true"
        aria-labelledby="briefing-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="briefing-card__close"
          onClick={onClose}
          data-sfx="decline"
          aria-label="Close"
        >
          <X size={18} strokeWidth={2.5} />
        </button>

        <div className="briefing-card__art" ref={artRef}>
          <img
            className="briefing-card__art-img"
            src={`/${career.image}_after_hover.png`}
            alt=""
            aria-hidden="true"
          />
        </div>

        <h2 id="briefing-title" className="briefing-card__title">
          {career.title}
        </h2>

        <p className="briefing-card__text">
          For the next hour, you&rsquo;ll experience selected moments from the
          career of <span className="briefing-card__career">{career.title}</span>.
          There are no perfect answers!! Only different ways professionals
          respond to competing responsibilities.
        </p>

        <button
          type="button"
          className="briefing-card__continue"
          onClick={onContinue}
        >
          Continue
        </button>
      </div>
    </div>
  )
}

export default CareerBriefingModal
