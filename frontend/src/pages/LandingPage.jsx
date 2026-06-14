import { Link } from 'react-router-dom'
import { LandingNavbar } from '../components/Navbar'
import {
  GraduationCap, Brain, FileText, BarChart3, Star, Shield,
  Zap, Users, Globe, ChevronRight, CheckCircle, MessageCircle,
  BookOpen, Award, ArrowRight, Play, Github
} from 'lucide-react'

const features = [
  {
    icon: MessageCircle,
    title: 'AI Chat Tutor',
    description: 'Get personalized explanations at your level — beginner, intermediate, or advanced. Ask anything, anytime.',
    color: 'primary',
    gradient: 'from-primary-600 to-primary-400',
  },
  {
    icon: Brain,
    title: 'Quiz Generator',
    description: 'AI-powered MCQ quizzes on any topic. Choose difficulty, track scores, and analyze your performance.',
    color: 'secondary',
    gradient: 'from-secondary-600 to-secondary-400',
  },
  {
    icon: FileText,
    title: 'Smart Summarizer',
    description: 'Transform any topic into concise study notes with key concepts, bullet points, and exportable PDFs.',
    color: 'accent',
    gradient: 'from-accent-600 to-accent-400',
  },
  {
    icon: BarChart3,
    title: 'Progress Tracking',
    description: 'Visual dashboards showing quiz scores, learning streaks, weak areas, and improvement over time.',
    color: 'primary',
    gradient: 'from-purple-600 to-pink-400',
  },
  {
    icon: Star,
    title: 'Personalized Recommendations',
    description: 'AI analyzes your performance and suggests topics, resources, and a custom learning path just for you.',
    color: 'secondary',
    gradient: 'from-teal-600 to-cyan-400',
  },
  {
    icon: Shield,
    title: 'Admin Panel',
    description: 'Full admin dashboard to manage students, monitor usage statistics, and generate reports.',
    color: 'accent',
    gradient: 'from-orange-600 to-yellow-400',
  },
]

const steps = [
  { step: '01', title: 'Create Account', desc: 'Sign up for free in seconds. No credit card required.' },
  { step: '02', title: 'Start Learning', desc: 'Ask the AI tutor, generate quizzes, or get topic summaries.' },
  { step: '03', title: 'Track Progress', desc: 'View your performance analytics and learning streak daily.' },
  { step: '04', title: 'Get Recommendations', desc: 'Receive personalized study paths based on your performance.' },
]

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Engineering Student',
    content: 'AI Learning Buddy completely changed how I study. The quiz generator helps me test my knowledge and the AI tutor explains concepts so clearly!',
    avatar: 'PS',
    rating: 5,
  },
  {
    name: 'James Okonkwo',
    role: 'High School Student',
    content: 'The personalized recommendations are incredible. It identified my weak areas in mathematics and created a perfect study plan for me.',
    avatar: 'JO',
    rating: 5,
  },
  {
    name: 'Mei Lin',
    role: 'University Student',
    content: 'The topic summarizer saves me hours of studying. I get well-structured notes instantly and can export them as PDFs!',
    avatar: 'ML',
    rating: 5,
  },
]

const stats = [
  { value: '10K+', label: 'Students Learning' },
  { value: '500K+', label: 'Quizzes Generated' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: 'SDG 4', label: 'Quality Education' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dark-950 overflow-x-hidden">
      <LandingNavbar />

      {/* ── Hero Section ── */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="bg-orb w-[600px] h-[600px] bg-primary-600 -top-32 -left-32" />
          <div className="bg-orb w-[400px] h-[400px] bg-secondary-600 bottom-0 right-0" style={{animationDelay: '3s'}} />
          <div className="bg-orb w-[300px] h-[300px] bg-accent-600 top-1/2 left-1/2" style={{animationDelay: '6s'}} />
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{backgroundImage: 'linear-gradient(rgba(108,99,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(108,99,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px'}} />

        <div className="container-app relative z-10 text-center py-20">
          {/* SDG Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary-500/30 text-primary-300 text-sm font-medium mb-8 animate-fade-in">
            <Globe className="w-4 h-4" />
            <span>Supporting UN SDG 4 — Quality Education</span>
            <CheckCircle className="w-4 h-4 text-green-400" />
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-bold font-display text-white mb-6 animate-slide-up">
            Learn Smarter with{' '}
            <span className="gradient-text">AI-Powered</span>
            <br />Education
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in" style={{animationDelay: '0.2s'}}>
            Your personalized AI learning assistant that tutors, generates quizzes, creates study notes,
            and tracks your progress — all powered by advanced AI.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up" style={{animationDelay: '0.3s'}}>
            <Link to="/register" className="btn-primary text-base px-8 py-4 shadow-glow-primary">
              Start Learning for Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="btn-ghost text-base px-8 py-4">
              <Play className="w-4 h-4" />
              Sign In
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto animate-fade-in" style={{animationDelay: '0.4s'}}>
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-bold gradient-text font-display">{value}</div>
                <div className="text-gray-500 text-sm mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="py-24 relative">
        <div className="container-app">
          <div className="text-center mb-16">
            <div className="badge-primary mb-4 mx-auto w-fit">✨ Powerful Features</div>
            <h2 className="text-4xl font-bold text-white font-display mb-4">
              Everything You Need to{' '}
              <span className="gradient-text">Excel</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              A comprehensive learning platform powered by cutting-edge AI to support every student's journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="card group cursor-default"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-24 bg-dark-900/50">
        <div className="container-app">
          <div className="text-center mb-16">
            <div className="badge-primary mb-4 mx-auto w-fit">🚀 Simple & Powerful</div>
            <h2 className="text-4xl font-bold text-white font-display mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.step} className="relative">
                <div className="card text-center">
                  <div className="text-5xl font-bold gradient-text font-display mb-4">{s.step}</div>
                  <h3 className="text-white font-semibold mb-2">{s.title}</h3>
                  <p className="text-gray-400 text-sm">{s.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 z-10">
                    <ChevronRight className="w-6 h-6 text-primary-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SDG 4 Section ── */}
      <section id="sdg-4" className="py-24">
        <div className="container-app">
          <div className="card max-w-4xl mx-auto relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 to-secondary-600/10" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-2xl bg-primary-gradient flex items-center justify-center shadow-glow-primary">
                  <Globe className="w-12 h-12 text-white" />
                </div>
              </div>
              <div>
                <div className="badge-primary mb-3">UN Sustainable Development Goal 4</div>
                <h2 className="text-3xl font-bold text-white font-display mb-3">
                  Quality Education for All
                </h2>
                <p className="text-gray-400 leading-relaxed mb-4">
                  AI Learning Buddy directly supports <strong className="text-white">SDG 4</strong> by ensuring inclusive and equitable quality education.
                  By leveraging AI, we remove barriers to personalized learning, making quality educational support
                  accessible to every student, regardless of location or resources.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Accessible Education', 'Personalized Learning', 'Global Reach', 'Equal Opportunity'].map(tag => (
                    <span key={tag} className="badge-primary text-xs">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="py-24 bg-dark-900/50">
        <div className="container-app">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white font-display mb-4">
              Loved by <span className="gradient-text">Students</span>
            </h2>
            <p className="text-gray-400">Join thousands of students already learning smarter</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={t.name} className="card animate-fade-in" style={{animationDelay: `${i * 0.15}s`}}>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">"{t.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-gradient flex items-center justify-center text-white font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">{t.name}</div>
                    <div className="text-gray-500 text-xs">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-24">
        <div className="container-app">
          <div className="relative overflow-hidden rounded-3xl p-12 text-center"
            style={{background: 'linear-gradient(135deg, #6C63FF20 0%, #14b89520 100%)', border: '1px solid rgba(108,99,255,0.2)'}}>
            <div className="bg-orb w-96 h-96 bg-primary-600 -top-20 -right-20 opacity-10" />
            <div className="relative z-10">
              <h2 className="text-4xl font-bold text-white font-display mb-4">
                Ready to Transform Your Learning?
              </h2>
              <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of students using AI to learn faster, smarter, and more effectively.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/register" className="btn-primary text-lg px-10 py-4">
                  Get Started — It's Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/login" className="btn-ghost text-lg px-8 py-4">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-dark-800 py-12">
        <div className="container-app">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary-gradient flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-white font-bold">AI Learning Buddy</span>
                <div className="text-gray-500 text-xs">Supporting SDG 4 — Quality Education</div>
              </div>
            </div>

            <div className="text-center text-gray-500 text-sm">
              © 2024 AI Learning Buddy. Built to empower students worldwide.
            </div>

            <div className="flex items-center gap-4 text-gray-500 text-sm">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
              <Link to="/register" className="hover:text-white transition-colors">Sign Up</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
