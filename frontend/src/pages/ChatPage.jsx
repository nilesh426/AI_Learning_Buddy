import { useState, useEffect, useRef } from 'react'
import AppLayout from '../components/AppLayout'
import { chatAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Send, Bot, User, Trash2, Settings, BookOpen,
  ChevronDown, RotateCcw, Copy, Check, Lightbulb
} from 'lucide-react'
import toast from 'react-hot-toast'
import { LoadingDots } from '../components/LoadingSpinner'

const MODES = [
  { value: 'beginner', label: '🟢 Beginner', desc: 'Simple explanations with analogies' },
  { value: 'intermediate', label: '🟡 Intermediate', desc: 'Balanced depth and clarity' },
  { value: 'advanced', label: '🔴 Advanced', desc: 'In-depth technical details' },
]

const SUBJECTS = [
  '', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
  'History', 'English', 'Economics', 'Geography', 'Programming',
]

const SUGGESTIONS = [
  'Explain the Pythagorean theorem',
  'What is machine learning?',
  'How does photosynthesis work?',
  'Explain Newton\'s laws of motion',
  'What is the water cycle?',
  'How does DNA replication work?',
]

export default function ChatPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('intermediate')
  const [subject, setSubject] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [copiedId, setCopiedId] = useState(null)
  const [historyLoading, setHistoryLoading] = useState(true)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    loadHistory()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadHistory = async () => {
    setHistoryLoading(true)
    try {
      const res = await chatAPI.getHistory({ per_page: 20 })
      const history = res.data.chats || []
      const formatted = history.reverse().flatMap(chat => [
        { id: `q-${chat.id}`, role: 'user', content: chat.question, timestamp: chat.timestamp },
        { id: `a-${chat.id}`, role: 'assistant', content: chat.answer, timestamp: chat.timestamp, chatId: chat.id },
      ])
      setMessages(formatted)
    } catch (err) {
      console.error('Failed to load chat history:', err)
    } finally {
      setHistoryLoading(false)
    }
  }

  const sendMessage = async (text = null) => {
    const question = (text || input).trim()
    if (!question || loading) return

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: question,
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await chatAPI.sendMessage({ question, mode, subject })
      const aiMsg = {
        id: `ai-${res.data.chat_id}`,
        role: 'assistant',
        content: res.data.answer,
        timestamp: new Date().toISOString(),
        chatId: res.data.chat_id,
      }
      setMessages(prev => [...prev, aiMsg])
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to get response. Please try again.'
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: 'error',
        content: errMsg,
        timestamp: new Date().toISOString(),
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const clearHistory = async () => {
    setMessages([])
    toast.success('Chat cleared')
  }

  const copyMessage = async (id, text) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-5rem)] lg:h-[calc(100vh-4rem)] max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div>
            <h1 className="page-title">AI Tutor</h1>
            <p className="page-subtitle">Ask any academic question — I'll explain it at your level</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`btn-ghost py-2 px-3 ${showSettings ? 'bg-primary-500/20 border-primary-500/30' : ''}`}
            >
              <Settings className="w-4 h-4" />
            </button>
            <button onClick={clearHistory} className="btn-ghost py-2 px-3 text-red-400 hover:text-red-300 hover:bg-red-500/10">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Settings panel */}
        {showSettings && (
          <div className="card mb-4 flex-shrink-0 animate-slide-up">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Explanation Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {MODES.map(m => (
                    <button
                      key={m.value}
                      onClick={() => setMode(m.value)}
                      className={`p-2 rounded-xl text-xs font-medium transition-all border ${mode === m.value ? 'border-primary-500 bg-primary-500/20 text-primary-300' : 'border-dark-700 text-gray-400 hover:border-dark-600'}`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="input-label">Subject (optional)</label>
                <select
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="input"
                >
                  {SUBJECTS.map(s => (
                    <option key={s} value={s}>{s || 'Any Subject'}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pb-4 min-h-0">
          {historyLoading ? (
            <div className="flex justify-center py-12">
              <LoadingDots />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-20 h-20 rounded-3xl bg-primary-gradient flex items-center justify-center mx-auto mb-6 shadow-glow-primary animate-float">
                <Bot className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white font-display mb-2">Your AI Learning Tutor</h2>
              <p className="text-gray-400 max-w-sm mb-8">Ask me anything about any subject. I'll explain concepts clearly at your chosen level.</p>
              <div className="grid grid-cols-2 gap-2 max-w-md w-full">
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="text-left p-3 rounded-xl border border-dark-700 hover:border-primary-500/50 hover:bg-primary-500/5 transition-all text-sm text-gray-400 hover:text-gray-300"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-primary-400 mb-1" />
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3 animate-fade-in ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-1 ${
                  msg.role === 'user' ? 'bg-primary-gradient' : msg.role === 'error' ? 'bg-red-500/20' : 'bg-dark-700 border border-dark-600'
                }`}>
                  {msg.role === 'user' ? (user?.name?.[0] || 'U') : msg.role === 'error' ? '!' : <Bot className="w-4 h-4 text-primary-400" />}
                </div>

                {/* Message */}
                <div className={`relative group max-w-[80%] ${msg.role === 'user' ? 'chat-bubble-user' : msg.role === 'error' ? 'max-w-[80%] bg-red-500/10 border border-red-500/20 text-red-300 px-5 py-3 rounded-2xl' : 'chat-bubble-ai'}`}>
                  {msg.role === 'assistant' ? (
                    <div className="markdown-content text-sm">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm">{msg.content}</p>
                  )}

                  {/* Copy button */}
                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => copyMessage(msg.id, msg.content)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg bg-dark-700 text-gray-400 hover:text-white"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}

                  <p className="text-xs text-white/30 mt-2 text-right">
                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                  </p>
                </div>
              </div>
            ))
          )}

          {/* Loading indicator */}
          {loading && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-dark-700 border border-dark-600 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary-400" />
              </div>
              <div className="chat-bubble-ai">
                <LoadingDots />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="flex-shrink-0 pt-4 border-t border-dark-800">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                id="chat-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything... (Shift+Enter for new line)"
                rows={1}
                className="input resize-none min-h-[44px] max-h-32 py-3 pr-4 leading-relaxed"
                style={{ height: 'auto' }}
                onInput={e => {
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px'
                }}
                disabled={loading}
              />
            </div>
            <button
              id="chat-send"
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="btn-primary py-3 px-4 flex-shrink-0 h-[44px]"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
            <span>Mode: <span className="text-primary-400">{MODES.find(m => m.value === mode)?.label}</span></span>
            {subject && <span>• Subject: <span className="text-primary-400">{subject}</span></span>}
            <span className="ml-auto">Enter to send • Shift+Enter for new line</span>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
