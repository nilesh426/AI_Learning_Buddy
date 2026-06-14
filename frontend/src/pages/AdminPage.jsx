import { useState, useEffect } from 'react'
import AppLayout from '../components/AppLayout'
import { adminAPI } from '../services/api'
import { LoadingSpinner } from '../components/LoadingSpinner'
import {
  Users, Brain, MessageCircle, BarChart3, Shield, Search, ToggleLeft, ToggleRight,
  TrendingUp, Activity, Award, UserCheck, UserX, X, HelpCircle, BookOpen
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-xl px-3 py-2 text-sm border border-dark-700">
        <p className="text-gray-400">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>
            <span className="font-semibold">{p.name}:</span> {p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function AdminPage() {
  const [tab, setTab] = useState('overview') // 'overview', 'users'
  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)

  // Users state
  const [users, setUsers] = useState([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState('')
  const [usersLoading, setUsersLoading] = useState(false)

  // Detail Modal state
  const [detailUser, setDetailUser] = useState(null)
  const [userDetailLoading, setUserDetailLoading] = useState(false)
  const [detailStats, setDetailStats] = useState(null)

  // Load Admin Stats
  const loadStats = async () => {
    setStatsLoading(true)
    try {
      const res = await adminAPI.getStats()
      setStats(res.data)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load platform statistics.')
    } finally {
      setStatsLoading(false)
    }
  }

  // Load Users list
  const loadUsers = async (page = 1, searchQuery = '') => {
    setUsersLoading(true)
    try {
      const res = await adminAPI.getUsers({ page, search: searchQuery })
      setUsers(res.data.users || [])
      setTotalUsers(res.data.total || 0)
      setCurrentPage(res.data.current_page || page)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load registered users.')
    } finally {
      setUsersLoading(false)
    }
  }

  useEffect(() => {
    if (tab === 'overview') {
      loadStats()
    } else {
      loadUsers(1, search)
    }
  }, [tab])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    loadUsers(1, search)
  }

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      const res = await adminAPI.toggleUserActive(userId)
      // Update local state
      setUsers(prev =>
        prev.map(u => (u.id === userId ? { ...u, is_active: res.data.is_active } : u))
      )
      toast.success(res.data.message)
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.error || 'Failed to update user status.')
    }
  }

  const handleOpenUserDetail = async (userId) => {
    setUserDetailLoading(true)
    try {
      const res = await adminAPI.getUserDetail(userId)
      setDetailUser(res.data.user)
      setDetailStats(res.data.stats)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load user details.')
    } finally {
      setUserDetailLoading(false)
    }
  }

  const handleCloseModal = () => {
    setDetailUser(null)
    setDetailStats(null)
  }

  const overview = stats?.overview || {}
  const topTopics = stats?.top_topics || []
  const dailyReg = stats?.daily_registrations || []

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-6 flex justify-between items-center flex-wrap gap-4 animate-slide-up">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Platform-wide system metrics, user activation status, and usage analytics.</p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-dark-900 border border-dark-800 p-1 rounded-xl">
          <button
            onClick={() => setTab('overview')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              tab === 'overview'
                ? 'bg-primary-500 text-white shadow-glow-primary'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setTab('users')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              tab === 'users'
                ? 'bg-primary-500 text-white shadow-glow-primary'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            User Management
          </button>
        </div>
      </div>

      {/* ── STATE: OVERVIEW ─────────────────────────────────── */}
      {tab === 'overview' && (
        statsLoading ? (
          <div className="flex justify-center items-center py-24">
            <LoadingSpinner size="lg" text="Loading platform telemetry..." />
          </div>
        ) : (
          <div className="space-y-8 animate-slide-up">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-400 flex-shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-gray-500 text-xs">Total Students</div>
                  <div className="text-white text-xl font-bold font-display mt-0.5">{overview.total_users}</div>
                  <div className="text-green-500 text-[10px] mt-0.5">+{overview.new_users_week} this week</div>
                </div>
              </div>

              <div className="card flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary-500/10 flex items-center justify-center text-secondary-400 flex-shrink-0">
                  <Brain className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-gray-500 text-xs">Quizzes Completed</div>
                  <div className="text-white text-xl font-bold font-display mt-0.5">{overview.total_quizzes}</div>
                  <div className="text-green-500 text-[10px] mt-0.5">+{overview.new_quizzes_week} this week</div>
                </div>
              </div>

              <div className="card flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent-500/10 flex items-center justify-center text-accent-400 flex-shrink-0">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-gray-500 text-xs">AI Chat Conversations</div>
                  <div className="text-white text-xl font-bold font-display mt-0.5">{overview.total_chats}</div>
                </div>
              </div>

              <div className="card flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 flex-shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-gray-500 text-xs">Average Quiz Score</div>
                  <div className="text-white text-xl font-bold font-display mt-0.5">{overview.avg_score}%</div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Daily Registrations */}
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-primary-400" />
                  <h3 className="text-white font-semibold font-display">Daily Registrations (7 Days)</h3>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={dailyReg}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="users" name="New Users" fill="#6C63FF" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Popular quiz topics */}
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-secondary-400" />
                  <h3 className="text-white font-semibold font-display">Popular Study Topics (Quizzes Generated)</h3>
                </div>
                {topTopics.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={topTopics} layout="vertical" barSize={12}>
                      <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="topic" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} width={120} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" name="Quizzes Taken" fill="#14b895" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                    <HelpCircle className="w-8 h-8 opacity-40 mb-2" />
                    <p className="text-sm">No topics data recorded yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      )}

      {/* ── STATE: USER MANAGEMENT ─────────────────────────── */}
      {tab === 'users' && (
        <div className="space-y-6 animate-slide-up">
          {/* Search bar card */}
          <div className="card py-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
              <input
                type="text"
                placeholder="Search students by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10 pr-4 py-2 text-sm"
              />
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
            </form>
            <div className="text-gray-500 text-xs">
              Showing <span className="text-white font-semibold">{users.length}</span> of {totalUsers} users
            </div>
          </div>

          {/* Users table */}
          <div className="card">
            {usersLoading ? (
              <div className="flex justify-center items-center py-16">
                <LoadingSpinner text="Fetching students list..." />
              </div>
            ) : users.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-dark-700 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Quizzes</th>
                      <th className="py-3 px-4">AI Chats</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-800">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-dark-800/30 transition-colors">
                        <td className="py-3 px-4">
                          <div>
                            <div className="text-white font-medium">{u.name}</div>
                            <div className="text-gray-500 text-xs">{u.email}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`badge text-[10px] ${u.role === 'admin' ? 'badge-danger' : 'badge-primary'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-gray-300 font-semibold">
                          {u.quiz_count}
                        </td>
                        <td className="py-3 px-4 font-mono text-gray-300 font-semibold">
                          {u.chat_count}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`badge text-[10px] ${u.is_active ? 'badge-success' : 'badge-danger'}`}>
                            {u.is_active ? 'Active' : 'Deactivated'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenUserDetail(u.id)}
                              className="text-primary-400 hover:text-primary-300 text-xs font-semibold hover:underline"
                            >
                              Stats
                            </button>
                            {u.role !== 'admin' && (
                              <button
                                onClick={() => handleToggleActive(u.id, u.is_active)}
                                className={`text-xs font-semibold flex items-center gap-0.5 hover:underline ${
                                  u.is_active ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'
                                }`}
                              >
                                {u.is_active ? (
                                  <>
                                    <UserX className="w-3.5 h-3.5" /> Deactivate
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="w-3.5 h-3.5" /> Activate
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16 text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No students found matching "{search}".</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── USER DETAIL MODAL ────────────────────────────────── */}
      {detailUser && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-filter backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="card max-w-md w-full border border-dark-750 relative animate-slide-up">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 btn-ghost p-1.5 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-white font-bold font-display text-lg mb-1">{detailUser.name}'s Learning Profile</h3>
            <p className="text-gray-500 text-xs mb-6">{detailUser.email}</p>

            {detailStats ? (
              <div className="space-y-5">
                {/* Score summary */}
                <div className="p-4 rounded-xl bg-dark-900/50 border border-dark-800 flex justify-around items-center">
                  <div className="text-center">
                    <div className="text-gray-500 text-[10px] uppercase font-semibold">Avg Score</div>
                    <div className="text-white text-xl font-bold font-display mt-0.5">
                      {detailStats.avg_score}%
                    </div>
                  </div>
                  <div className="w-px h-8 bg-dark-800" />
                  <div className="text-center">
                    <div className="text-gray-500 text-[10px] uppercase font-semibold">Quizzes</div>
                    <div className="text-white text-xl font-bold font-display mt-0.5">
                      {detailStats.quiz_count}
                    </div>
                  </div>
                  <div className="w-px h-8 bg-dark-800" />
                  <div className="text-center">
                    <div className="text-gray-500 text-[10px] uppercase font-semibold">Tutor Chats</div>
                    <div className="text-white text-xl font-bold font-display mt-0.5">
                      {detailStats.chat_count}
                    </div>
                  </div>
                </div>

                {/* Additional metadata */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-purple-400" /> Unique Topics:
                    </span>
                    <span className="text-white font-medium">{detailStats.topics_studied} studied</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-primary-400" /> Account Status:
                    </span>
                    <span className={`badge text-[9px] ${detailUser.is_active ? 'badge-success' : 'badge-danger'}`}>
                      {detailUser.is_active ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Registered On:</span>
                    <span className="text-gray-400">{new Date(detailUser.created_at).toLocaleDateString()}</span>
                  </div>
                  {detailUser.last_login && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">Last Active:</span>
                      <span className="text-gray-400">{new Date(detailUser.last_login).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {detailUser.bio && (
                  <div className="p-3 bg-dark-800/40 rounded-xl border border-dark-850 mt-4">
                    <div className="text-[10px] font-semibold text-gray-500 uppercase mb-1">Student Goal/Bio</div>
                    <p className="text-xs text-gray-400 italic">"{detailUser.bio}"</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex justify-center items-center py-8">
                <LoadingSpinner text="Fetching user details..." />
              </div>
            )}
            
            <div className="mt-8 pt-4 border-t border-dark-800 flex justify-end">
              <button
                onClick={handleCloseModal}
                className="btn-ghost text-xs py-2 px-4"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
