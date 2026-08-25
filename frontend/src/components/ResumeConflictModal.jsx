import { PlusCircle, Play, TriangleAlert } from 'lucide-react'

function ResumeConflictModal({ currentCareerName, newCareerName, onResume, onStartNew, onCancel }) {
  // Right now there's only one real career to pick, so this conflict is
  // almost always "you clicked the same career you already have in
  // progress" — the two-career wording ("begin a new path as a Data
  // Analyst" when you're already mid-Data-Analyst) reads as a mistake, not
  // a real choice. Keep the generic two-name copy for whenever a second
  // career actually exists and this can be a genuine "switch career" case.
  const isSameCareer = currentCareerName === newCareerName

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className="relative w-full max-w-lg p-10 rounded-[2.8rem] border border-red-400/30 text-[#f2e9dc]"
        style={{
          background: 'linear-gradient(150deg, #2d2154, #6b4d94)',
          boxShadow: '0 20px 45px rgba(20, 16, 43, 0.55), 0 0 40px rgba(239, 68, 68, 0.15)',
        }}
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-8 border border-red-400/25">
            <TriangleAlert className="w-9 h-9 text-red-300" strokeWidth={1.5} />
          </div>

          <h2 className="font-serif text-4xl font-medium tracking-wide mb-4 text-[#d9a94f]">
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
                You currently have an active simulation in progress for{' '}
                <strong className="font-semibold text-[#f2e9dc]">{currentCareerName}</strong>.
                Would you prefer to resume your journey, or begin a new path as a{' '}
                <strong className="font-semibold text-[#f2e9dc]">{newCareerName}</strong>?
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

        <div className="mt-8 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <button
              type="button"
              onClick={onStartNew}
              className="w-full sm:w-1/2 py-4 px-6 rounded-full text-sm font-medium tracking-wide flex items-center justify-center gap-2 bg-[#14102b] border border-[#6b4d94]/50 text-[#f2e9dc] hover:bg-[#6b4d94]/20 transition-colors"
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

          <button
            type="button"
            onClick={onCancel}
            className="w-full py-3 px-8 rounded-full text-sm font-medium tracking-wide text-[#f2e9dc]/60 hover:text-[#d9a94f] hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResumeConflictModal
