import { useState, useEffect } from 'react'
import AppLayout from '../components/AppLayout'
import { progressAPI } from '../services/api'
import { LoadingSpinner } from '../components/LoadingSpinner'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend
} from 'recharts'
import {
  Trophy, Flame, MessageCircle, Brain, BookOpen, BarChart3,
  Calendar, Award, Star, Activity, Sparkles
} from 'lucide-react'
import toast from 'react-hot-toast'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-xl px-3 py-2 text-sm border border-dark-700">
        <p className="text-gray-400">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>
            <span className="font-semibold">{p.name}:</span> {p.value}
            {p.name.includes('Score') ? '%' : ''}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function ProgressPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await progressAPI.get()
        setData(res.data)
      } catch (err) {
        console.error(err)
        toast.error('Failed to load progress analytics.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center py-24">
          <LoadingSpinner size="lg" text="Analyzing your learning history..." />
        </div>
      </AppLayout>
    )
  }

  const overview = data?.overview || {}
  const weekly = data?.weekly_activity || []
  const recentScores = data?.recent_scores || []
  const topicPerf = data?.topic_performance || {}
  const difficultyStats = data?.difficulty_stats || {}

  // Format topic performance for chart
  const topicChartData = Object.entries(topicPerf).map(([topic, score]) => ({
    topic: topic.length > 15 ? topic.slice(0, 15) + '…' : topic,
    score
  }))

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-6 animate-slide-up">
        <h1 className="page-title">Progress & Analytics</h1>
        <p className="page-subtitle">Track your learning journey, quiz statistics, and topic strengths.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-slide-up">
        <div className="card flex items-center gap-4 relative overflow-hidden">
          <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-400 flex-shrink-0">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="text-gray-500 text-xs">Quizzes Completed</div>
            <div className="text-white text-xl font-bold font-display mt-0.5">{overview.total_quizzes}</div>
          </div>
        </div>

        <div className="card flex items-center gap-4 relative overflow-hidden">
          <div className="w-12 h-12 rounded-xl bg-secondary-500/10 flex items-center justify-center text-secondary-400 flex-shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="text-gray-500 text-xs">Average Quiz Score</div>
            <div className="text-white text-xl font-bold font-display mt-0.5">{overview.avg_score}%</div>
          </div>
        </div>

        <div className="card flex items-center gap-4 relative overflow-hidden">
          <div className="w-12 h-12 rounded-xl bg-accent-500/10 flex items-center justify-center text-accent-400 flex-shrink-0">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="text-gray-500 text-xs">Current Streak</div>
            <div className="text-white text-xl font-bold font-display mt-0.5">{overview.learning_streak} Days</div>
          </div>
        </div>

        <div className="card flex items-center gap-4 relative overflow-hidden">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 flex-shrink-0">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-gray-500 text-xs">AI Chat Sessions</div>
            <div className="text-white text-xl font-bold font-display mt-0.5">{overview.total_chats}</div>
          </div>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8 animate-slide-up">
        {/* Weekly Activity */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-primary-400" />
            <h3 className="text-white font-semibold font-display">Weekly Activity</h3>
          </div>
          {weekly.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={weekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: 10, fontSize: 12 }} />
                <Bar dataKey="quizzes" name="Quizzes" fill="#6C63FF" radius={[4, 4, 0, 0]} />
                <Bar dataKey="chats" name="Chats" fill="#14b895" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-gray-500">
              <Calendar className="w-8 h-8 opacity-40 mb-2" />
              <p className="text-sm">No activity recorded this week.</p>
            </div>
          )}
        </div>

        {/* Score Progression */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-secondary-400" />
            <h3 className="text-white font-semibold font-display">Score Progression (Last 10 Quizzes)</h3>
          </div>
          {recentScores.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={recentScores}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="topic" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="score"
                  name="Score"
                  stroke="#14b895"
                  strokeWidth={3}
                  dot={{ r: 4, stroke: '#14b895', strokeWidth: 2, fill: '#12131f' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-gray-500">
              <Trophy className="w-8 h-8 opacity-40 mb-2" />
              <p className="text-sm">Complete a quiz to view score progression.</p>
            </div>
          )}
        </div>
      </div>

      {/* Topics and Difficulties */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8 animate-slide-up">
        {/* Topic Breakdown */}
        <div className="card lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <h3 className="text-white font-semibold font-display">Topic Proficiency Breakdown</h3>
          </div>
          {topicChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topicChartData} layout="vertical" barSize={14}>
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="topic" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="score" name="Avg. Score %" fill="url(#blueGreenGradient)" radius={[0, 4, 4, 0]} />
                <defs>
                  <linearGradient id="blueGreenGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6C63FF" />
                    <stop offset="100%" stopColor="#14b895" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
              <BookOpen className="w-8 h-8 opacity-40 mb-2" />
              <p className="text-sm">No topic statistics available.</p>
            </div>
          )}
        </div>

        {/* Difficulty Breakdown */}
        <div className="card flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-accent-400" />
              <h3 className="text-white font-semibold font-display">Performance by Difficulty</h3>
            </div>
            
            <div className="space-y-4">
              {['easy', 'medium', 'hard'].map((level) => {
                const stat = difficultyStats[level] || { count: 0, avg_score: 0 }
                return (
                  <div key={level} className="p-3 rounded-xl bg-dark-800/40 border border-dark-800">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 capitalize">{level}</span>
                      <span className="text-xs text-gray-500">{stat.count} quizzes</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-dark-900 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            level === 'easy' ? 'bg-green-500' :
                            level === 'medium' ? 'bg-amber-400' : 'bg-red-500'
                          }`}
                          style={{ width: `${stat.avg_score}%` }}
                        ></div>
                      </div>
                      <span className="text-white text-xs font-semibold font-mono">{stat.avg_score}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="text-xs text-gray-500 border-t border-dark-800 pt-3 mt-4 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent-400" />
            <span>Target hard difficulties to build higher proficiency.</span>
          </div>
        </div>
      </div>

      {/* History table */}
      <div className="card animate-slide-up">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-primary-400" />
          <h3 className="text-white font-semibold font-display">Recent Assessments</h3>
        </div>
        {recentScores.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-dark-700 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-2.5 px-4">Topic</th>
                  <th className="py-2.5 px-4">Difficulty</th>
                  <th className="py-2.5 px-4">Score</th>
                  <th className="py-2.5 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800 text-sm">
                {recentScores.map((score, index) => (
                  <tr key={index} className="hover:bg-dark-800/20 transition-colors">
                    <td className="py-2.5 px-4 text-white font-medium">{score.topic}</td>
                    <td className="py-2.5 px-4">
                      <span className={`badge text-[10px] ${
                        score.difficulty === 'easy' ? 'badge-success' : 
                        score.difficulty === 'hard' ? 'badge-danger' : 'badge-warning'
                      }`}>
                        {score.difficulty}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-semibold">
                      <span className={score.score >= 85 ? 'text-green-400' : score.score >= 65 ? 'text-yellow-400' : 'text-red-400'}>
                        {score.score}%
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-xs text-gray-500">
                      {new Date(score.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">
            No quiz performance history found.
          </div>
        )}
      </div>
    </AppLayout>
  )
}
