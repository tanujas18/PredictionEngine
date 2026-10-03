import { Badge } from '@/components/ui/badge'

export default function WinBar({ probabilities = {}, className = '' }) {
  const { home = 0, draw = 0, away = 0 } = probabilities
  const total = home + draw + away
  const normalized = total > 0 ? { home, draw, away } : { home: 33, draw: 34, away: 33 }

  return (
    <div className={className}>
      <div className="flex h-4 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
        <div
          className="bg-green-500 transition-all duration-300"
          style={{ width: `${normalized.home}%` }}
        />
        <div
          className="bg-amber-500 transition-all duration-300"
          style={{ width: `${normalized.draw}%` }}
        />
        <div
          className="bg-red-500 transition-all duration-300"
          style={{ width: `${normalized.away}%` }}
        />
      </div>
      <div className="flex items-center justify-between gap-2 mt-2 text-xs">
        <Badge variant="outline" className="text-[10px] px-2 py-0.5">
          Home {normalized.home}%
        </Badge>
        <Badge variant="outline" className="text-[10px] px-2 py-0.5">
          Draw {normalized.draw}%
        </Badge>
        <Badge variant="outline" className="text-[10px] px-2 py-0.5">
          Away {normalized.away}%
        </Badge>
      </div>
    </div>
  )
}