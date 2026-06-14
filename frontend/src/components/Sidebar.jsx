import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, MessageCircle, Brain, FileText,
  BarChart3, Star, User, Shield, LogOut, GraduationCap, X
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/chat', icon: MessageCircle, label: 'AI Tutor' },
  { to: '/quiz', icon: Brain, label: 'Quiz Generator' },
  { to: '/summarizer', icon: FileText, label: 'Summarizer' },
  { to: '/progress', icon: BarChart3, label: 'Progress' },
  { to: '/recommendations', icon: Star, label: 'Recommendations' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export default function Sidebar({ onClose }) {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <aside className="h-full flex flex-col bg-dark-900 border-r border-dark-800">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-dark-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary-gradient flex items-center justify-center shadow-glow-primary">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-sm font-display">AI Learning</div>
            <div className="text-primary-400 text-xs">Buddy</div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden btn-ghost p-1.5">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* User info */}
      <div className="p-4 border-b border-dark-800">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-dark-800/50">
          <div className="w-9 h-9 rounded-full bg-primary-gradient flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="text-white text-sm font-medium truncate">{user?.name || 'Student'}</div>
            <div className="text-gray-500 text-xs truncate">{user?.email}</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <Icon className="w-4.5 h-4.5 flex-shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <div className="h-px bg-dark-700 my-2" />
            <NavLink
              to="/admin"
              onClick={onClose}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Shield className="w-4.5 h-4.5 flex-shrink-0" />
              <span>Admin Panel</span>
            </NavLink>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-dark-800">
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut className="w-4.5 h-4.5 flex-shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
