import { useState } from 'react'
import { ChevronDown, X } from 'lucide-react'

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'my', label: 'Myanmar (မြန်မာ)' },
]

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

function SettingsModal({ onClose }) {
  const [music, setMusic] = useState(true)
  const [soundEffects, setSoundEffects] = useState(true)
  const [language, setLanguage] = useState('en')
  const [darkMode, setDarkMode] = useState(true)

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

        <h2 className="text-center font-serif text-4xl font-medium tracking-wide mb-10 text-[#d9a94f]">
          Settings
        </h2>

        <div className="space-y-6 mb-10">
          <div className="flex items-center justify-between py-2">
            <span className="text-base font-normal tracking-wide">Music</span>
            <Toggle checked={music} onChange={() => setMusic((v) => !v)} label="Music" />
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-base font-normal tracking-wide">Sound Effects</span>
            <Toggle
              checked={soundEffects}
              onChange={() => setSoundEffects((v) => !v)}
              label="Sound Effects"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-base font-normal tracking-wide">Dark Mode</span>
            <Toggle
              checked={darkMode}
              onChange={() => setDarkMode((v) => !v)}
              label="Dark Mode"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-base font-normal tracking-wide">Language</span>
            <div className="relative w-44">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full text-[#f2e9dc] text-sm rounded-xl px-4 py-2.5 border border-[#6b4d94]/50 focus:outline-none focus:border-[#d9a94f] appearance-none cursor-pointer bg-[#14102b]"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-[#d9a94f]">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal
