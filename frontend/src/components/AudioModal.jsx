import { SlidersHorizontal, X } from 'lucide-react'
import AudioControls from './AudioControls.jsx'
import CosmicModal from './CosmicModal.jsx'

function AudioModal({
  onClose,
  musicEnabled,
  sfxEnabled,
  volume,
  onMusicChange,
  onSfxChange,
  onVolumeChange,
}) {
  return (
    <CosmicModal onClose={onClose} labelledBy="audio-modal-title">
      <button
        type="button"
        onClick={onClose}
        data-sfx="decline"
        className="absolute top-6 right-6 text-[#f2e9dc]/80 hover:text-[#d9a94f] transition-colors z-10"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-14 h-14 rounded-full bg-[#6b4d94]/25 flex items-center justify-center mb-4 border border-[#c4d0ff]/30">
          <SlidersHorizontal className="w-6 h-6 text-[#d9a94f]" />
        </div>

        <h2
          id="audio-modal-title"
          className="font-serif text-4xl font-medium tracking-wide mb-2 text-[#d9a94f]"
        >
          Sound Settings
        </h2>
        <p className="text-sm text-[#f2e9dc]/60">Adjust your immersive audio experience.</p>
      </div>

      <AudioControls
        musicEnabled={musicEnabled}
        sfxEnabled={sfxEnabled}
        volume={volume}
        onMusicChange={onMusicChange}
        onSfxChange={onSfxChange}
        onVolumeChange={onVolumeChange}
      />
    </CosmicModal>
  )
}

export default AudioModal
