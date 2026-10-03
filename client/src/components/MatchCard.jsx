import { Card, CardContent } from '@/components/ui/card'
import { Link } from 'react-router-dom'

export default function MatchCard({ match }) {
  const { id, league, kickoff, status, score, home, away, model } = match

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(kickoff))

  const isFinished = status === 'finished'

  // Calculate win probability percentages for progress bars
  const homeWinProb = model?.probabilities?.home || 33.33
  const drawProb = model?.probabilities?.draw || 33.33
  const awayWinProb = model?.probabilities?.away || 33.33

  return (
    <Link to={`/match/${id}`} className="block">
      <Card className="hover:shadow-md transition-shadow border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
        <CardContent className="p-4">
          {/* Header - League and Status */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {league}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              • {isFinished ? 'Full time' : 'Full Time'}
            </span>
          </div>

          {/* Match Content */}
          <div className="space-y-2 mb-3">
            {/* Home Team Row */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <img
                  src={home.crest}
                  alt={home.name}
                  className="w-7 h-7 rounded-full flex-shrink-0 object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                  {home.name}
                </span>
              </div>
              <span className="text-3xl font-bold text-slate-900 dark:text-slate-100 tabular-nums w-10 text-right flex-shrink-0">
                {isFinished && score ? score.home : '-'}
              </span>
            </div>

            {/* Away Team Row */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <img
                  src={away.crest}
                  alt={away.name}
                  className="w-7 h-7 rounded-full flex-shrink-0 object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                  {away.name}
                </span>
              </div>
              <span className="text-3xl font-bold text-slate-900 dark:text-slate-100 tabular-nums w-10 text-right flex-shrink-0">
                {isFinished && score ? score.away : '-'}
              </span>
            </div>
          </div>

          {/* Probability Bar */}
          {model && (
            <div className="mb-3">
              <div className="flex h-1.5 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                <div
                  className="bg-blue-500"
                  style={{ width: `${homeWinProb}%` }}
                  title={`${home.name} win: ${homeWinProb.toFixed(1)}%`}
                />
                <div
                  className="bg-slate-300 dark:bg-slate-600"
                  style={{ width: `${drawProb}%` }}
                  title={`Draw: ${drawProb.toFixed(1)}%`}
                />
                <div
                  className="bg-purple-500"
                  style={{ width: `${awayWinProb}%` }}
                  title={`${away.name} win: ${awayWinProb.toFixed(1)}%`}
                />
              </div>
            </div>
          )}

          {/* Footer - Date and Result */}
          <div className="flex items-center justify-between text-xs">
            <time className="text-slate-500 dark:text-slate-400" dateTime={kickoff}>
              {formattedDate}
            </time>
            {model && isFinished && (
              <span className="text-slate-500 dark:text-slate-400">
                Result:{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {match.result === 'draw' ? 'Draw' : match.result === 'home' ? home.name : away.name}
                </span>
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
