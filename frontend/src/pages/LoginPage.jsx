import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name}!`)
      navigate(user.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 relative overflow-hidden bg-dark-900">
        <div className="bg-orb w-96 h-96 bg-primary-600 -top-20 -left-20" />
        <div className="bg-orb w-64 h-64 bg-secondary-600 bottom-10 right-10" style={{animationDelay: '3s'}} />
        <div className="relative z-10 text-center px-12">
          <div className="w-20 h-20 rounded-3xl bg-primary-gradient flex items-center justify-center mx-auto mb-8 shadow-glow-primary animate-float">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white font-display mb-4">
            Welcome Back to<br /><span className="gradient-text">AI Learning Buddy</span>
          </h2>
          <p className="text-gray-400 leading-relaxed max-w-sm mx-auto">
            Your AI-powered personalized learning assistant. Continue your journey to academic excellence.
          </p>
          <div className="mt-10 space-y-4">
            {[
              '🧠 AI Tutor available 24/7',
              '📊 Track your learning progress',
              '🎯 Personalized study recommendations',
            ].map(item => (
              <div key={item} className="flex items-center gap-3 text-gray-300 text-sm">
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-primary-gradient flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold font-display">AI Learning Buddy</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white font-display mb-2">Sign In</h1>
            <p className="text-gray-400">Don't have an account? <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">Create one free</Link></p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="input-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  id="login-email"
                  type="email"
                  className="input pl-10"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="input-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="input pl-10 pr-10"
                  placeholder="Your password"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              className="btn-primary w-full justify-center py-3.5 text-base"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 rounded-xl bg-dark-800 border border-dark-700">
            <p className="text-xs text-gray-500 mb-2 font-medium">Demo Credentials:</p>
            <div className="space-y-1 text-xs text-gray-400">
              <div><span className="text-gray-500">Admin:</span> admin@ailearningbuddy.com / Admin@123456</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
