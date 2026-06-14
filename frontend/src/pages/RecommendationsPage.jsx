import { useState, useEffect } from 'react'
import AppLayout from '../components/AppLayout'
import { recommendationsAPI } from '../services/api'
import { LoadingSpinner } from '../components/LoadingSpinner'
import {
  Star, RefreshCw, PlayCircle, BookOpen, Globe, FileText, Check, CheckCircle,
  ExternalLink, Compass, Flame, AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function RecommendationsPage() {
  const [recs, setRecs] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadRecs = async (showToast = false) => {
    try {
      const res = await recommendationsAPI.get()
      setRecs(res.data.recommendations || [])
      if (showToast) toast.success('Loaded latest recommendations!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to load study recommendations.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRecs()
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const res = await recommendationsAPI.refresh()
      setRecs(res.data.recommendations || [])
      toast.success('AI updated your study pathway!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to refresh recommendations.')
    } finally {
      setRefreshing(false)
    }
  }

  const handleMarkRead = async (id) => {
    try {
      await recommendationsAPI.markRead(id)
      setRecs(prev => prev.map(r => r.id === id ? { ...r, is_read: true } : r))
      toast.success('Dismissed recommendation')
    } catch (err) {
      console.error(err)
      toast.error('Failed to update recommendation.')
    }
  }

  const getPriorityBadge = (prio) => {
    switch (prio) {
      case 1:
        return <span className="badge badge-danger text-[10px] font-semibold tracking-wider uppercase">High Priority</span>
      case 2:
        return <span className="badge badge-warning text-[10px] font-semibold tracking-wider uppercase">Medium Priority</span>
      default:
        return <span className="badge badge-primary text-[10px] font-semibold tracking-wider uppercase">Low Priority</span>
    }
  }

  const getResourceIcon = (type) => {
    const t = type?.toLowerCase() || ''
    if (t.includes('video')) return <PlayCircle className="w-5 h-5 text-red-400" />
    if (t.includes('book')) return <BookOpen className="w-5 h-5 text-blue-400" />
    if (t.includes('article') || t.includes('web')) return <Globe className="w-5 h-5 text-green-400" />
    if (t.includes('doc')) return <FileText className="w-5 h-5 text-yellow-400" />
    return <Star className="w-5 h-5 text-primary-400" />
  }

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-6 flex justify-between items-center flex-wrap gap-4 animate-slide-up">
        <div>
          <h1 className="page-title">Personalized Recommendations</h1>
          <p className="page-subtitle">AI-curated learning plans and recommended resources based on your quiz & conversation history.</p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className="btn-primary py-2.5 text-sm shadow-glow-primary flex items-center gap-1.5 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Regenerating...' : 'Refresh Pathway'}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <LoadingSpinner size="lg" text="Consulting AI tutor for custom learning pathway..." />
        </div>
      ) : recs.filter(r => !r.is_read).length > 0 ? (
        /* Grid list of recommendations */
        <div className="grid md:grid-cols-2 gap-6 animate-slide-up">
          {recs
            .filter(r => !r.is_read)
            .map((rec) => (
              <div
                key={rec.id}
                className={`card relative flex flex-col justify-between border-l-4 overflow-hidden ${
                  rec.priority === 1 ? 'border-l-red-500' :
                  rec.priority === 2 ? 'border-l-orange-400' : 'border-l-primary-500'
                }`}
              >
                {/* Top header within card */}
                <div>
                  <div className="flex justify-between items-center gap-3 flex-wrap mb-3">
                    <div className="flex items-center gap-1.5">
                      {getResourceIcon(rec.resource_type)}
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        {rec.resource_type || 'General Study'}
                      </span>
                    </div>
                    {getPriorityBadge(rec.priority)}
                  </div>

                  {rec.topic && (
                    <span className="badge badge-primary bg-primary-500/10 text-primary-300 border border-primary-500/20 text-[10px] uppercase font-semibold mb-2">
                      Topic: {rec.topic}
                    </span>
                  )}

                  <p className="text-white text-sm md:text-base leading-relaxed mt-2 font-display">
                    {rec.recommendation_text}
                  </p>
                </div>

                {/* Bottom action row within card */}
                <div className="mt-6 pt-4 border-t border-dark-800 flex justify-between items-center gap-4 flex-wrap">
                  {rec.resource_url ? (
                    <a
                      href={rec.resource_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-400 hover:text-primary-300 text-xs font-semibold flex items-center gap-1 group"
                    >
                      Study Reference
                      <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                  ) : (
                    <span className="text-gray-500 text-xs">Self study recommendation</span>
                  )}

                  <button
                    onClick={() => handleMarkRead(rec.id)}
                    className="btn-ghost py-1.5 px-3 rounded-lg text-xs hover:bg-green-500/10 hover:text-green-300 border-white/5 hover:border-green-500/20"
                  >
                    Done / Dismiss
                  </button>
                </div>
              </div>
            ))}
        </div>
      ) : (
        /* Empty/All completed state */
        <div className="max-w-2xl mx-auto card text-center py-16 animate-slide-up flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-secondary-500/10 text-secondary-400 flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-white font-bold text-xl font-display">All Caught Up!</h2>
          <p className="text-gray-400 text-sm max-w-md mt-1">
            You've completed or dismissed all recommended activities. Good job keeping your study pathway clean!
          </p>
          <div className="mt-8 flex gap-4">
            <button
              onClick={handleRefresh}
              className="btn-primary shadow-glow-primary"
            >
              <RefreshCw className="w-4.5 h-4.5" />
              Generate Recommendations
            </button>
          </div>
          <div className="mt-6 flex items-center gap-2 text-xs text-gray-500 max-w-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>
              AI generates recommendations by reviewing topics where your quiz scores fell below 80% or where you had tutor sessions.
            </span>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
