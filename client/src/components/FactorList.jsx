import { Badge } from '@/components/ui/badge'

function ProgressBar({ value, impact, className = '' }) {
  const colorClass = impact === 'home' ? 'bg-green-500' : impact === 'away' ? 'bg-red-500' : 'bg-slate-500'
  return (
    <div className={`relative h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700 ${className}`}>
      <div
        className={`${colorClass} h-full transition-all duration-300`}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  )
}

export default function FactorList({ factors = [], homeTeam = {}, awayTeam = {} }) {
  if (!factors?.length) return null

  const getImpactLabel = (impact) => {
    switch (impact) {
      case 'home':
        return homeTeam.short ?? 'Home'
      case 'away':
        return awayTeam.short ?? 'Away'
      default:
        return 'Neutral'
    }
  }

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'home':
        return 'text-green-600 dark:text-green-400'
      case 'away':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-slate-600 dark:text-slate-400'
    }
  }

  return (
    <div className="space-y-3">
      {factors.map((factor, idx) => (
        <div key={idx} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium truncate">{factor.label}</span>
            <Badge variant="outline" className={`text-xs ${getImpactColor(factor.impact)}`}>
              {getImpactLabel(factor.impact)}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <ProgressBar value={factor.weight ?? 0} impact={factor.impact} className="flex-1" />
            <span className="text-xs text-slate-500 dark:text-slate-400 w-10 text-right">
              {factor.weight ?? 0}%
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">{factor.detail}</p>
        </div>
      ))}
    </div>
  )
}