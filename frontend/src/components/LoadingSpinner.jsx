import { Loader2 } from 'lucide-react'

export function LoadingSpinner({ size = 'md', text = '' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className={`${sizes[size]} text-primary-400 animate-spin`} />
      {text && <p className="text-gray-400 text-sm">{text}</p>}
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary-gradient flex items-center justify-center mx-auto mb-4 shadow-glow-primary animate-pulse">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
        <p className="text-gray-400">Loading...</p>
      </div>
    </div>
  )
}

export function LoadingDots() {
  return (
    <div className="flex items-center gap-1 p-2">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-primary-400"
          style={{ animation: `loadingDot 1.4s ${i * 0.2}s infinite ease-in-out both` }}
        />
      ))}
    </div>
  )
}

export default LoadingSpinner
