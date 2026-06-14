import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'primary', trend = null }) {
  const colorMap = {
    primary: {
      bg: 'bg-primary-500/10',
      icon: 'text-primary-400',
      border: 'border-primary-500/20',
      glow: 'shadow-glow-primary',
    },
    secondary: {
      bg: 'bg-secondary-500/10',
      icon: 'text-secondary-400',
      border: 'border-secondary-500/20',
      glow: 'shadow-glow-secondary',
    },
    accent: {
      bg: 'bg-accent-500/10',
      icon: 'text-accent-400',
      border: 'border-accent-500/20',
      glow: '',
    },
    danger: {
      bg: 'bg-red-500/10',
      icon: 'text-red-400',
      border: 'border-red-500/20',
      glow: '',
    },
  }

  const c = colorMap[color] || colorMap.primary

  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus
  const trendColor = trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-gray-400'

  return (
    <div className={`stat-card border ${c.border} hover:${c.glow} animate-fade-in`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-white font-display">{value}</p>
          {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
          {trend !== null && (
            <div className={`flex items-center gap-1 mt-2 ${trendColor} text-xs`}>
              <TrendIcon className="w-3 h-3" />
              <span>{Math.abs(trend)}% vs last week</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-6 h-6 ${c.icon}`} />
        </div>
      </div>
    </div>
  )
}
