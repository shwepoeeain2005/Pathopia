import { LogOut } from 'lucide-react'
import CosmicModal from './CosmicModal.jsx'

function LeaveSimulationModal({ onContinue, onExit }) {
  return (
    <CosmicModal labelledBy="leave-sim-title">
      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-[#6b4d94]/25 flex items-center justify-center mb-8 border border-[#c4d0ff]/30">
          <LogOut className="w-9 h-9 text-[#d9a94f]" strokeWidth={1.5} />
        </div>

        <h2
          id="leave-sim-title"
          className="font-serif text-4xl font-medium tracking-wide mb-4 text-[#d9a94f]"
        >
          Leave Simulation?
        </h2>

        <p className="text-base leading-relaxed text-[#f2e9dc]/80 px-2">
          Your progress has been saved. Resume anytime from Dashboard.
        </p>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full">
        <button
          type="button"
          onClick={onExit}
          className="w-full sm:w-1/2 py-4 px-6 rounded-full text-sm font-medium tracking-wide flex items-center justify-center gap-2 bg-[#14102b] border border-[#6b4d94]/50 text-[#f2e9dc] hover:bg-[#6b4d94]/20 transition-colors"
        >
          Exit
        </button>

        <button
          type="button"
          onClick={onContinue}
          className="w-full sm:w-1/2 py-4 px-6 rounded-full text-sm font-medium tracking-wide flex items-center justify-center gap-2 shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(217,169,79,0.6)]"
          style={{ backgroundColor: '#d9a94f', color: '#14102b' }}
        >
          Continue
        </button>
      </div>
    </CosmicModal>
  )
}

export default LeaveSimulationModal
