import { useEffect } from 'react'
import { PlusCircle, Play, TriangleAlert, X } from 'lucide-react'
import CosmicModal from './CosmicModal.jsx'
import { playSfx } from '../lib/audioEngine.js'
import { SFX } from '../lib/audioTracks.js'

function ResumeConflictModal({ currentCareerName, newCareerName, isSameCareer, onResume, onStartNew, onCancel }) {
  // isSameCareer is decided by the caller from the career id, not by
  // comparing these display names — the unfinished run's title comes from
  // the database while newCareerName comes from the frontend's CAREERS
  // list, and the two aren't always byte-identical for the same career.
  // Keep the generic two-name copy for whenever a second career actually
  // exists and this can be a genuine "switch career" case.

  useEffect(() => {
    playSfx(SFX.synthWarning)
  }, [])

  return (
    <CosmicModal tone="danger" onClose={onCancel} labelledBy="resume-conflict-title">
      <button
        type="button"
        onClick={onCancel}
        data-sfx="decline"
        className="absolute top-6 right-6 text-[#f2e9dc]/80 hover:text-[#d9a94f] transition-colors z-10"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-8 border border-red-400/25">
          <TriangleAlert className="w-9 h-9 text-red-300" strokeWidth={1.5} />
        </div>

        <h2
          id="resume-conflict-title"
          className="font-serif text-4xl font-medium tracking-wide mb-4 text-[#d9a94f]"
        >
          Unfinished Simulation
        </h2>

        <p className="text-base leading-relaxed text-[#f2e9dc]/80 px-2">
          {isSameCareer ? (
            <>
              You have an unfinished{' '}
              <strong className="font-semibold text-[#f2e9dc]">{currentCareerName}</strong>{' '}
              simulation. Resume where you left off, or start over from scratch?
            </>
          ) : (
            <>
              You have an unfinished{' '}
              <strong className="font-semibold text-[#f2e9dc]">{currentCareerName}</strong>{' '}
              simulation. Resume where you left off, or start a{' '}
              <strong className="font-semibold text-[#f2e9dc]">{newCareerName}</strong>{' '}
              simulation instead?
            </>
          )}
        </p>

        <div className="mt-6 w-full bg-red-500/10 border border-red-400/25 rounded-xl px-6 py-4">
          <p className="text-sm text-red-200 leading-relaxed font-medium">
            {isSameCareer
              ? 'Starting over will overwrite your existing progress permanently.'
              : 'Starting a new simulation will overwrite your existing progress permanently.'}
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full">
        <button
          type="button"
          onClick={onStartNew}
          className="w-full sm:w-1/2 py-4 px-6 rounded-full text-sm font-medium tracking-wide flex items-center justify-center gap-2 bg-transparent border border-[#6b4d94]/50 text-[#f2e9dc] hover:bg-[#14102b] transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          {isSameCareer ? 'Start Over' : `Start ${newCareerName} instead`}
        </button>

        <button
          type="button"
          onClick={onResume}
          className="w-full sm:w-1/2 py-4 px-6 rounded-full text-sm font-medium tracking-wide flex items-center justify-center gap-2 shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(217,169,79,0.6)]"
          style={{ backgroundColor: '#d9a94f', color: '#14102b' }}
        >
          <Play className="w-4 h-4" fill="#14102b" />
          {isSameCareer ? 'Resume' : `Resume ${currentCareerName}`}
        </button>
      </div>
    </CosmicModal>
  )
}

export default ResumeConflictModal
