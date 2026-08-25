import { Bell, Music, Volume2 } from 'lucide-react'

function Toggle({ checked, onChange, label }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
        aria-label={label}
      />
      <div className="w-12 h-6 rounded-full peer bg-[#14102b] peer-checked:bg-[#d9a94f] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#f2e9dc] after:border-[#6b4d94] after:border after:rounded-full after:h-5 after:w-5 after:transition-all" />
    </label>
  )
}

function AudioControls({
  musicEnabled,
  sfxEnabled,
  volume,
  onMusicChange,
  onSfxChange,
  onVolumeChange,
  showVolume = true,
}) {
  return (
    <div className="w-full text-left">
      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#14102b]/40 border border-[#6b4d94]/30 hover:bg-[#6b4d94]/10 transition-colors">
          <div className="flex items-center gap-4">
            <Music className="w-5 h-5 text-[#d9a94f]" />
            <div className="flex flex-col">
              <span className="text-[17px] font-serif text-[#f2e9dc]">Music</span>
              <span className="text-[11px] text-[#f2e9dc]/60">Ambient background tracks</span>
            </div>
          </div>
          <Toggle checked={musicEnabled} onChange={(e) => onMusicChange(e.target.checked)} label="Music" />
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-[#14102b]/40 border border-[#6b4d94]/30 hover:bg-[#6b4d94]/10 transition-colors">
          <div className="flex items-center gap-4">
            <Bell className="w-5 h-5 text-[#d9a94f]" />
            <div className="flex flex-col">
              <span className="text-[17px] font-serif text-[#f2e9dc]">Sound Effects</span>
              <span className="text-[11px] text-[#f2e9dc]/60">UI interactions and alerts</span>
            </div>
          </div>
          <Toggle checked={sfxEnabled} onChange={(e) => onSfxChange(e.target.checked)} label="Sound Effects" />
        </div>
      </div>

      {showVolume && (
        <div className="flex flex-col gap-4 mt-2 p-4 rounded-xl bg-[#14102b]/40 border border-[#6b4d94]/30 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-[#d9a94f]" />
              <span className="text-[17px] font-serif text-[#f2e9dc]">Master Volume</span>
            </div>
            <span className="text-lg font-semibold text-[#d9a94f]">{volume}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            aria-label="Master Volume"
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="w-full h-1 appearance-none outline-none cursor-pointer rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(0,0,0,0.5)] [&::-webkit-slider-thumb]:cursor-pointer"
            style={{
              background: `linear-gradient(to right, #d9a94f ${volume}%, rgba(107, 77, 148, 0.3) ${volume}%)`,
            }}
          />
        </div>
      )}
    </div>
  )
}

export default AudioControls
