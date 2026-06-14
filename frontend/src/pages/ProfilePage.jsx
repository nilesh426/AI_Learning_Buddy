import { useState } from 'react'
import AppLayout from '../components/AppLayout'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import {
  User as UserIcon, Mail, Shield, BookOpen, Key, AlertCircle, Save, Lock, Sparkles, Check
} from 'lucide-react'
import toast from 'react-hot-toast'

// Premium default avatar presets
const AVATAR_PRESETS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=Felix',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Buddy',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Alex',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Milo',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Zoe',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Leo',
]

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  
  // Form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    avatar_url: user?.avatar_url || '',
  })

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    password: '',
    confirm_password: '',
  })

  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileForm(prev => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordForm(prev => ({ ...prev, [name]: value }))
  }

  const handleAvatarSelect = (url) => {
    setProfileForm(prev => ({ ...prev, avatar_url: url }))
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    if (!profileForm.name.trim()) {
      toast.error('Name cannot be empty')
      return
    }

    setProfileLoading(true)
    try {
      const res = await authAPI.updateProfile({
        name: profileForm.name.trim(),
        bio: profileForm.bio.trim(),
        avatar_url: profileForm.avatar_url,
      })
      updateUser(res.data.user)
      toast.success('Profile updated successfully!')
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.error || 'Failed to update profile.')
    } finally {
      setProfileLoading(false)
    }
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    const { current_password, password, confirm_password } = passwordForm

    if (!current_password || !password || !confirm_password) {
      toast.error('All password fields are required')
      return
    }

    if (password !== confirm_password) {
      toast.error('New passwords do not match')
      return
    }

    setPasswordLoading(true)
    try {
      await authAPI.updateProfile({
        current_password,
        password,
      })
      setPasswordForm({
        current_password: '',
        password: '',
        confirm_password: '',
      })
      toast.success('Password changed successfully!')
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.error || 'Failed to change password.')
    } finally {
      setPasswordLoading(false)
    }
  }

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-6 animate-slide-up">
        <h1 className="page-title">Profile Settings</h1>
        <p className="page-subtitle">Manage your personalized learning identity, bio, and security credentials.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start animate-slide-up">
        {/* Left Side: User Card & Avatar presets */}
        <div className="lg:col-span-1 space-y-6">
          {/* User card summary */}
          <div className="card text-center flex flex-col items-center">
            <div className="relative mb-4">
              {profileForm.avatar_url ? (
                <img
                  src={profileForm.avatar_url}
                  alt="User Avatar"
                  className="w-20 h-20 rounded-full border-2 border-primary-500 bg-dark-900 object-cover shadow-glow-primary"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary-gradient flex items-center justify-center text-white font-bold text-2xl shadow-glow-primary">
                  {initials}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 bg-primary-600 rounded-lg p-1 text-white border border-dark-850">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>

            <h2 className="text-white font-bold text-lg font-display">{user?.name}</h2>
            <p className="text-gray-500 text-xs mt-0.5">{user?.email}</p>
            
            <div className="mt-3 flex items-center gap-1.5">
              <span className={`badge ${user?.role === 'admin' ? 'badge-danger' : 'badge-primary'}`}>
                <Shield className="w-3 h-3" />
                {user?.role === 'admin' ? 'Administrator' : 'Student'}
              </span>
            </div>

            {user?.bio && (
              <p className="text-gray-400 text-xs mt-4 italic max-w-xs px-2 line-clamp-3">
                "{user.bio}"
              </p>
            )}
          </div>

          {/* Avatar presets selection */}
          <div className="card">
            <h3 className="text-white font-semibold text-sm font-display mb-3">Choose AI Avatar Preset</h3>
            <div className="grid grid-cols-3 gap-3">
              {AVATAR_PRESETS.map((url, i) => {
                const isSelected = profileForm.avatar_url === url
                return (
                  <button
                    key={i}
                    onClick={() => handleAvatarSelect(url)}
                    type="button"
                    className={`relative p-1.5 rounded-xl border bg-dark-900/40 hover:scale-105 transition-all ${
                      isSelected ? 'border-primary-500 bg-primary-500/5' : 'border-dark-700 hover:border-dark-500'
                    }`}
                  >
                    <img src={url} alt={`Preset ${i}`} className="w-full h-10 object-contain" />
                    {isSelected && (
                      <div className="absolute top-1 right-1 bg-green-500 rounded-full p-0.5 text-white">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Profile & Security forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile settings Form */}
          <div className="card">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-400">
                <UserIcon className="w-5 h-5" />
              </div>
              <h3 className="text-white font-bold font-display text-lg">General Settings</h3>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="input-label" htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="input-label" htmlFor="bio">About Me / Learning Goals</label>
                <textarea
                  id="bio"
                  name="bio"
                  placeholder="Tell us about what you're learning, your study schedule, or your educational targets..."
                  value={profileForm.bio}
                  onChange={handleProfileChange}
                  className="input h-28 resize-none"
                  maxLength={500}
                />
                <div className="text-right text-[10px] text-gray-500 mt-1">
                  {profileForm.bio.length} / 500 characters
                </div>
              </div>

              <div>
                <label className="input-label" htmlFor="avatar_url">Custom Avatar URL (Optional)</label>
                <input
                  type="url"
                  id="avatar_url"
                  name="avatar_url"
                  placeholder="https://example.com/my-avatar.png"
                  value={profileForm.avatar_url}
                  onChange={handleProfileChange}
                  className="input text-xs"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="btn-primary flex items-center gap-1.5 shadow-glow-primary"
                >
                  <Save className="w-4.5 h-4.5" />
                  {profileLoading ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>

          {/* Change password Form */}
          <div className="card">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-accent-500/10 flex items-center justify-center text-accent-400">
                <Key className="w-5 h-5" />
              </div>
              <h3 className="text-white font-bold font-display text-lg">Update Password</h3>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="input-label" htmlFor="current_password">Current Password</label>
                <input
                  type="password"
                  id="current_password"
                  name="current_password"
                  value={passwordForm.current_password}
                  onChange={handlePasswordChange}
                  className="input"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="input-label" htmlFor="password">New Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={passwordForm.password}
                    onChange={handlePasswordChange}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="input-label" htmlFor="confirm_password">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirm_password"
                    name="confirm_password"
                    value={passwordForm.confirm_password}
                    onChange={handlePasswordChange}
                    className="input"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-dark-800/40 rounded-xl border border-dark-800 flex gap-2 items-start text-xs text-gray-500">
                <AlertCircle className="w-4 h-4 text-accent-500 flex-shrink-0 mt-0.5" />
                <span>Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.</span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="btn-ghost flex items-center gap-1.5 hover:bg-white/10 hover:text-white"
                >
                  <Lock className="w-4.5 h-4.5" />
                  {passwordLoading ? 'Updating...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
