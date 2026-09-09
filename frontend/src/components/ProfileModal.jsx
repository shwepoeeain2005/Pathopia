import { useEffect, useRef, useState } from 'react'
import { Camera, Pencil, User as UserIcon, X } from 'lucide-react'
import CosmicModal from './CosmicModal.jsx'

const PROFILE_ME_URL = '/api/user/me'
const PROFILE_UPDATE_URL = '/api/user/profile'

// No file storage/CDN in this project — the picture is sent and stored as a
// compressed data URI. Resizing client-side before upload keeps that URI
// small enough to comfortably fit in one JSON request and the database's
// TEXT column, instead of shipping a multi-megabyte original photo.
const MAX_AVATAR_DIMENSION = 320
const AVATAR_JPEG_QUALITY = 0.82

function compressImageToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, MAX_AVATAR_DIMENSION / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', AVATAR_JPEG_QUALITY))
      }
      img.onerror = () => reject(new Error('Could not read that image.'))
      img.src = String(reader.result)
    }
    reader.onerror = () => reject(new Error('Could not read that file.'))
    reader.readAsDataURL(file)
  })
}

// The backend returns the real reason in the response body (e.g. "Name
// cannot be empty."); read it instead of throwing away everything but the
// status code, so a save failure is actually diagnosable.
async function readErrorMessage(response) {
  const text = await response.text()
  return text || `Update failed with status ${response.status}`
}

function ProfileModal({ onClose }) {
  const [avatarPreview, setAvatarPreview] = useState(
    () => localStorage.getItem('profilePictureUrl') || null,
  )
  const [isSavingAvatar, setIsSavingAvatar] = useState(false)
  const [name, setName] = useState(() => localStorage.getItem('fullName') || '')
  const [email] = useState(() => localStorage.getItem('userEmail') || '')
  const [isEditingName, setIsEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(name)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  // localStorage is only a cache from the last login/edit — refresh from the
  // database on open so the modal shows what's actually saved (e.g. if the
  // picture was set from a different session).
  useEffect(() => {
    let cancelled = false
    async function loadProfile() {
      const token = localStorage.getItem('authToken')
      try {
        const response = await fetch(PROFILE_ME_URL, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!response.ok || cancelled) return
        const data = await response.json()
        if (cancelled) return

        if (data.fullName) {
          setName(data.fullName)
          setNameDraft(data.fullName)
          localStorage.setItem('fullName', data.fullName)
        }
        if (data.profilePictureUrl) {
          setAvatarPreview(data.profilePictureUrl)
          localStorage.setItem('profilePictureUrl', data.profilePictureUrl)
        }
      } catch {
        // Freshness check only — keep whatever localStorage/defaults already
        // show if this fails, the modal still works from cached values.
      }
    }
    loadProfile()
    return () => {
      cancelled = true
    }
  }, [])

  const handleAvatarClick = () => fileInputRef.current?.click()

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = '' // allow picking the same file again later
    if (!file) return

    setError('')
    setIsSavingAvatar(true)
    try {
      const dataUrl = await compressImageToDataUrl(file)
      const token = localStorage.getItem('authToken')
      const response = await fetch(PROFILE_UPDATE_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ profilePictureUrl: dataUrl }),
      })

      if (!response.ok) {
        throw new Error(await readErrorMessage(response))
      }

      setAvatarPreview(dataUrl)
      localStorage.setItem('profilePictureUrl', dataUrl)
    } catch (err) {
      setError(err.message || 'Could not save your profile picture. Please try again.')
    } finally {
      setIsSavingAvatar(false)
    }
  }

  const startEditingName = () => {
    setNameDraft(name)
    setError('')
    setIsEditingName(true)
  }

  const cancelNameEdit = () => {
    setNameDraft(name)
    setError('')
    setIsEditingName(false)
  }

  const confirmNameEdit = async () => {
    const trimmed = nameDraft.trim()
    if (!trimmed) {
      setError('Name cannot be empty.')
      return
    }

    setIsSaving(true)
    setError('')
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(PROFILE_UPDATE_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fullName: trimmed }),
      })

      if (!response.ok) {
        throw new Error(await readErrorMessage(response))
      }

      setName(trimmed)
      localStorage.setItem('fullName', trimmed)
      setIsEditingName(false)
    } catch (err) {
      setError(err.message || 'Could not save your name. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <CosmicModal onClose={onClose} labelledBy="profile-modal-title">
      <button
        type="button"
        onClick={onClose}
        data-sfx="decline"
        className="absolute top-6 right-6 text-[#f2e9dc]/80 hover:text-[#d9a94f] transition-colors z-10"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>

      <h2
        id="profile-modal-title"
        className="text-center font-serif text-4xl font-medium tracking-wide mb-12 text-[#d9a94f]"
      >
        Profile
      </h2>

        <div className="flex justify-center mb-8">
          <div className="group relative w-28 h-28">
            <div
              className="w-28 h-28 rounded-full flex items-center justify-center shadow-lg border-2 border-[#d9a94f]/40 overflow-hidden"
              style={{
                background: 'radial-gradient(circle, rgba(217,169,79,0.4) 0%, rgba(45,33,84,0.8) 80%)',
                opacity: isSavingAvatar ? 0.6 : 1,
              }}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-14 h-14 text-[#d9a94f]" strokeWidth={1.5} />
              )}
            </div>

            <button
              type="button"
              onClick={handleAvatarClick}
              disabled={isSavingAvatar}
              className="absolute bottom-0 right-0 flex items-center justify-center w-9 h-9 rounded-full bg-[#d9a94f] text-[#14102b] border-2 border-[#14102b] opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity disabled:cursor-not-allowed"
              aria-label="Change profile picture"
            >
              <Camera className="w-4 h-4" />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
        </div>

        <div className="space-y-6 mb-8">
          <div>
            <label className="block text-xs font-medium text-[#f2e9dc]/70 mb-2 tracking-wide uppercase">
              Name
            </label>
            <div className="flex items-center gap-2 rounded-xl px-4 py-3.5 border border-[#6b4d94]/50 shadow-inner bg-[#14102b]">
              {isEditingName ? (
                <input
                  type="text"
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  autoFocus
                  className="flex-1 min-w-0 bg-transparent text-sm text-[#f2e9dc] placeholder-[#f2e9dc]/40 focus:outline-none"
                />
              ) : (
                <span className="flex-1 text-sm text-[#f2e9dc]">{name || 'No name set'}</span>
              )}

              {isEditingName ? (
                <button
                  type="button"
                  onClick={cancelNameEdit}
                  disabled={isSaving}
                  className="text-[#f2e9dc]/60 hover:text-[#f2e9dc] transition-colors disabled:opacity-50"
                  aria-label="Cancel edit"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startEditingName}
                  className="text-[#f2e9dc]/60 hover:text-[#d9a94f] transition-colors"
                  aria-label="Edit name"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#f2e9dc]/70 mb-2 tracking-wide uppercase">
              Email
            </label>
            <p className="px-4 py-3.5 text-sm text-[#f2e9dc]/60 italic">
              {email || 'No email on file'}
            </p>
          </div>
        </div>

        {error && (
          <p className="mb-4 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={confirmNameEdit}
          disabled={!isEditingName || isSaving}
          className="w-full py-4 rounded-xl font-medium text-sm tracking-wide shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(217,169,79,0.6)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg"
          style={{ backgroundColor: '#d9a94f', color: '#14102b' }}
        >
          {isSaving ? 'Applying...' : 'Apply'}
        </button>
    </CosmicModal>
  )
}


export default ProfileModal
