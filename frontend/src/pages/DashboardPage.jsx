import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import StatCard from '../components/StatCard'
import { progressAPI, chatAPI, quizAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import {
  Brain, MessageCircle, BookOpen, BarChart3, Zap, ArrowRight,
  Trophy, Flame, Star, Clock, TrendingUp, AlertCircle
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts'
import { LoadingSpinner } from '../components/LoadingSpinner'

const quickLinks = [
  { to: '/chat', icon: MessageCircle, label: 'AI Tutor', desc: 'Ask any question', color: 'primary', gradient: 'from-primary-600 to-primary-400' },
  { to: '/quiz', icon: Brain, label: 'Take Quiz', desc: 'Test your knowledge', color: 'secondary', gradient: 'from-secondary-600 to-secondary-400' },
  { to: '/summarizer', icon: BookOpen, label: 'Summarize', desc: 'Create study notes', color: 'accent', gradient: 'from-accent-600 to-accent-400' },
  { to: '/progress', icon: BarChart3, label: 'Progress', desc: 'View analytics', color: 'primary', gradient: 'from-purple-600 to-pink-400' },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-xl px-3 py-2 text-sm border border-dark-700">
        <p className="text-gray-400">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{color: p.color}}>{p.name}: {p.value}</p>
        ))}
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [progress, setProgress] = useState(null)
  const [recentChats, setRecentChats] = useState([])
  const [recentQuizzes, setRecentQuizzes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [progRes, chatRes, quizRes] = await Promise.allSettled([
          progressAPI.get(),
          chatAPI.getHistory({ per_page: 3 }),
          quizAPI.getHistory({ per_page: 3 }),
        ])
        if (progRes.status === 'fulfilled') setProgress(progRes.value.data)
        if (chatRes.status === 'fulfilled') setRecentChats(chatRes.value.data.chats || [])
        if (quizRes.status === 'fulfilled') setRecentQuizzes(quizRes.value.data.quizzes || [])
      } catch (err) {
        console.error('Dashboard load error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const overview = progress?.overview || {}
  const weekly = progress?.weekly_activity || []
  const topicPerf = progress?.topic_performance || {}

  const topicData = Object.entries(topicPerf).slice(0, 8).map(([topic, score]) => ({
    topic: topic.length > 12 ? topic.slice(0, 12) + '…' : topic,
    score,
  }))

  const timeOfDay = new Date().getHours()
  const greeting = timeOfDay < 12 ? 'Good Morning' : timeOfDay < 17 ? 'Good Afternoon' : 'Good Evening'

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-8 animate-slide-up">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="page-title">{greeting}, {user?.name?.split(' ')[0]} 👋</h1>
            <p className="page-subtitle">Ready to learn something new today?</p>
          </div>
          {overview.learning_streak > 0 && (
            <div className="flex items-center gap-2 glass rounded-xl px-4 py-2 border border-accent-500/20">
              <Flame className="w-5 h-5 text-accent-400" />
              <span className="text-white font-semibold">{overview.learning_streak} day streak!</span>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Loading your dashboard..." />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard title="Quizzes Taken" value={overview.total_quizzes || 0} icon={Brain} color="primary" subtitle="All time" />
            <StatCard title="Avg. Score" value={`${overview.avg_score || 0}%`} icon={Trophy} color="secondary" subtitle="Quiz performance" />
            <StatCard title="AI Conversations" value={overview.total_chats || 0} icon={MessageCircle} color="accent" subtitle="Questions asked" />
            <StatCard title="Topics Studied" value={overview.topics_studied || 0} icon={BookOpen} color="primary" subtitle="Unique topics" />
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {quickLinks.map(({ to, icon: Icon, label, desc, gradient }) => (
                <Link
                  key={to}
                  to={to}
                  className="card group hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-white font-medium text-sm">{label}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{desc}</div>
                </Link>
              ))}
            </div>
          </div>

          {/* Charts row */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Weekly activity */}
            <div className="card">
              <h3 className="text-white font-semibold mb-4">Weekly Activity</h3>
              {weekly.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={weekly} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="quizzes" name="Quizzes" fill="#6C63FF" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="chats" name="Chats" fill="#14b895" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                  <BarChart3 className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">No activity data yet</p>
                  <Link to="/quiz" className="text-primary-400 text-xs mt-2 hover:text-primary-300">Take your first quiz →</Link>
                </div>
              )}
            </div>

            {/* Topic performance */}
            <div className="card">
              <h3 className="text-white font-semibold mb-4">Topic Performance</h3>
              {topicData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={topicData} layout="vertical" barSize={16}>
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="topic" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="score" name="Score %" fill="url(#barGradient)" radius={[0, 4, 4, 0]} />
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#6C63FF" />
                        <stop offset="100%" stopColor="#14b895" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                  <TrendingUp className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">No topic data yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent activity */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Chats */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Recent Conversations</h3>
                <Link to="/chat" className="text-primary-400 text-xs hover:text-primary-300 flex items-center gap-1">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              {recentChats.length > 0 ? (
                <div className="space-y-3">
                  {recentChats.map(chat => (
                    <div key={chat.id} className="flex items-start gap-3 p-3 rounded-xl bg-dark-800/50">
                      <MessageCircle className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-gray-300 text-sm line-clamp-2">{chat.question}</p>
                        <p className="text-gray-600 text-xs mt-1">
                          {new Date(chat.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No conversations yet</p>
                  <Link to="/chat" className="text-primary-400 text-xs mt-1 hover:text-primary-300 block">Start chatting with AI →</Link>
                </div>
              )}
            </div>

            {/* Recent Quizzes */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Recent Quizzes</h3>
                <Link to="/quiz" className="text-primary-400 text-xs hover:text-primary-300 flex items-center gap-1">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              {recentQuizzes.length > 0 ? (
                <div className="space-y-3">
                  {recentQuizzes.map(quiz => {
                    const pct = quiz.total_questions > 0 ? Math.round(quiz.score / quiz.total_questions * 100) : 0
                    return (
                      <div key={quiz.id} className="flex items-center gap-3 p-3 rounded-xl bg-dark-800/50">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${pct >= 70 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {pct}%
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-gray-300 text-sm font-medium truncate">{quiz.topic}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`badge text-xs ${quiz.difficulty === 'easy' ? 'badge-success' : quiz.difficulty === 'hard' ? 'badge-danger' : 'badge-warning'}`}>
                              {quiz.difficulty}
                            </span>
                            <span className="text-gray-600 text-xs">{new Date(quiz.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No quizzes yet</p>
                  <Link to="/quiz" className="text-primary-400 text-xs mt-1 hover:text-primary-300 block">Generate your first quiz →</Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </AppLayout>
  )
}
