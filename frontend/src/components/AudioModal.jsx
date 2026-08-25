import { SlidersHorizontal, X } from 'lucide-react'
import AudioControls from './AudioControls.jsx'

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className="relative w-full max-w-lg p-10 rounded-[2.8rem] border border-[#6b4d94]/30 text-[#f2e9dc]"
        style={{
          background: 'linear-gradient(150deg, #2d2154, #6b4d94)',
          boxShadow: '0 20px 45px rgba(20, 16, 43, 0.55), 0 0 40px rgba(107, 77, 148, 0.3)',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-8 right-8 text-[#f2e9dc]/80 hover:text-[#d9a94f] transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-[#6b4d94]/20 flex items-center justify-center mb-4 border border-[#6b4d94]/30">
            <SlidersHorizontal className="w-6 h-6 text-[#d9a94f]" />
          </div>

          <h2 className="font-serif text-4xl font-medium tracking-wide mb-2 text-[#d9a94f]">
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
      </div>
    </div>
  )
}

export default AudioModal
