import { Trash2, X } from 'lucide-react'
import CosmicModal from './CosmicModal.jsx'

function DeleteRunModal({ careerTitle, isDeleting, onConfirm, onCancel }) {
  return (
    <CosmicModal tone="danger" onClose={isDeleting ? undefined : onCancel} labelledBy="delete-run-title">
      <button
        type="button"
        onClick={onCancel}
        disabled={isDeleting}
        className="absolute top-6 right-6 text-[#f2e9dc]/80 hover:text-[#d9a94f] transition-colors z-10 disabled:opacity-40"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-8 border border-red-400/25">
          <Trash2 className="w-9 h-9 text-red-300" strokeWidth={1.5} />
        </div>

        <h2
          id="delete-run-title"
          className="font-serif text-4xl font-medium tracking-wide mb-4 text-[#d9a94f]"
        >
          Delete This Run?
        </h2>

        <p className="text-base leading-relaxed text-[#f2e9dc]/80 px-2">
          This will permanently remove your{' '}
          <strong className="font-semibold text-[#f2e9dc]">{careerTitle}</strong>{' '}
          simulation and its reflection from your history.
        </p>

        <div className="mt-6 w-full bg-red-500/10 border border-red-400/25 rounded-xl px-6 py-4">
          <p className="text-sm text-red-200 leading-relaxed font-medium">
            This cannot be undone.
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full">
        <button
          type="button"
          onClick={onCancel}
          disabled={isDeleting}
          className="w-full sm:w-1/2 py-4 px-6 rounded-full text-sm font-medium tracking-wide flex items-center justify-center gap-2 bg-transparent border border-[#6b4d94]/50 text-[#f2e9dc] hover:bg-[#14102b] transition-colors disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={isDeleting}
          className="w-full sm:w-1/2 py-4 px-6 rounded-full text-sm font-medium tracking-wide flex items-center justify-center gap-2 shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(239,68,68,0.5)] disabled:opacity-60 disabled:hover:scale-100"
          style={{ backgroundColor: '#ef4444', color: '#14102b' }}
        >
          <Trash2 className="w-4 h-4" />
          {isDeleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </CosmicModal>
  )
}

export default DeleteRunModal
