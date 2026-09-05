import { useEffect } from 'react'
import './CosmicModal.css'

/** A four-point sparkle, used for the frame's corner stars. */
function CosmicStar({ className }) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true">
      <path
        d="M50 2c4 30 14 44 48 48-34 4-44 18-48 48-4-30-14-44-48-48 34-4 44-18 48-48z"
        fill="currentColor"
      />
    </svg>
  )
}

/**
 * Shared modal shell: the glowing neon frame, navy-to-violet gradient and
 * starfield used by every dialog card in the app. Callers supply only the
 * inner content.
 *
 * Pass `onClose` to enable closing via the backdrop or the Escape key.
 * Dialogs that must force a choice (Leave Simulation, Resume Conflict)
 * simply leave it off.
 */
function CosmicModal({
  children,
  onClose,
  tone = 'default',
  size = 'md',
  labelledBy,
  describedBy,
  className = '',
}) {
  useEffect(() => {
    if (!onClose) return
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const width = { sm: 420, md: 520, lg: 640 }[size] ?? 520

  return (
    <div
      className="cosmic-overlay"
      onClick={onClose ? () => onClose() : undefined}
      role="presentation"
    >
      <div
        className={[
          'cosmic-modal',
          tone === 'danger' ? 'cosmic-modal--danger' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        style={{ width: `min(${width}px, 100%)` }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        onClick={(event) => event.stopPropagation()}
      >
        <CosmicStar className="cosmic-modal__star cosmic-modal__star--tl" />
        <CosmicStar className="cosmic-modal__star cosmic-modal__star--tl-sm" />
        <CosmicStar className="cosmic-modal__star cosmic-modal__star--br" />
        <CosmicStar className="cosmic-modal__star cosmic-modal__star--br-sm" />

        <div className="cosmic-modal__body">{children}</div>
      </div>
    </div>
  )
}

export default CosmicModal
