import { useParams, Link } from 'react-router-dom'
import { useFetch } from '@/hooks/useFetch'
import { getMatch, getPrediction } from '@/api/matches'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { usePredictions } from '@/state/PredictionsProvider'
import ErrorState from '@/components/ErrorState'
import WinBar from '@/components/WinBar'
import FactorList from '@/components/FactorList'

export default function MatchDetail() {
  const { id } = useParams<{ id: string }>()
  const predictionsContext = usePredictions()
  const { save, remove, pickFor } = predictionsContext

  const matchId = id ?? ''

  const { data, status, error, reload } = useFetch(
    () => {
      if (!matchId) return Promise.resolve([null, null] as const)
      return Promise.all([getMatch(matchId), getPrediction(matchId)])
    },
    [matchId]
  )

  const match: any = data?.[0] ?? null
  const prediction: any = data?.[1] ?? null
  const savedPick = pickFor(matchId)

  if (status === 'loading') {
    return (
      <div className="page max-w-3xl">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32 mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="text-center p-4">
                  <Skeleton className="h-3 w-16 mx-auto" />
                  <Skeleton className="h-5 w-24 mx-auto mt-1" />
                </div>
              ))}
            </div>
            <div className="border-t">
              <Skeleton className="h-5 w-48 mt-6" />
              <div className="space-y-4 mt-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
                <div className="grid gap-2 sm:grid-cols-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="text-center p-3">
                      <Skeleton className="h-6 w-12 mx-auto" />
                      <Skeleton className="h-3 w-24 mx-auto mt-1" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="border-t">
              <Skeleton className="h-5 w-32 mt-6" />
              <div className="flex flex-wrap gap-2 mt-4">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-16" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === 'error' || !match) {
    return (
      <ErrorState
        error={error}
        onRetry={reload}
        message={`No match found with ID "${matchId}"`}
      />
    )
  }

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZoneName: 'short',
  }).format(new Date(match.kickoff))

  const isFinished = match.status === 'finished'

  return (
    <div className="page max-w-3xl">
      <Link to="/" className="mb-6 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
        ← Back to Matches
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              {match.home.crest && (
                <img
                  src={match.home.crest}
                  alt={match.home.name}
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => { 
                    e.currentTarget.style.display = 'none'
                  }}
                />
              )}
              <CardTitle className="text-2xl">
                {match.home.name} vs {match.away.name}
              </CardTitle>
              {match.away.crest && (
                <img
                  src={match.away.crest}
                  alt={match.away.name}
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => { 
                    e.currentTarget.style.display = 'none'
                  }}
                />
              )}
            </div>
            <Badge variant="secondary">{match.league}</Badge>
          </div>
          {match.stage && <p className="text-slate-500 dark:text-slate-400 mt-2">{match.stage}</p>}
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {match.venue && (
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Venue</p>
                <p className="font-medium">{match.venue}</p>
              </div>
            )}
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Kickoff</p>
              <time dateTime={match.kickoff} className="font-medium">
                {formattedDate}
              </time>
            </div>
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Status</p>
              <Badge variant={isFinished ? 'default' : 'secondary'} className="capitalize">
                {match.status}
              </Badge>
            </div>
          </div>

{isFinished && match.score && (
            <div className="text-center py-4">
              <p className="text-4xl font-bold tabular-nums">
                {match.score.home} - {match.score.away}
              </p>
              {match.result && (
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  {match.result === 'draw' ? 'Draw' : match.result === 'home' ? `${match.home.name} win` : `${match.away.name} win`}
                </p>
              )}
            </div>
          )}

          <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
            <h3 className="text-lg font-semibold mb-4">Match Prediction</h3>
            {prediction ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <Badge variant="default">
                      {prediction.pick === 'home' ? match.home.name : prediction.pick === 'away' ? match.away.name : 'Draw'}
                    </Badge>
                    <Badge variant={prediction.confidence === 'high' ? 'default' : prediction.confidence === 'medium' ? 'secondary' : 'outline'}>
                      {prediction.confidence} confidence
                    </Badge>
                  </div>
                  <WinBar probabilities={prediction.probabilities} />
                </div>

                {prediction.expectedGoals && prediction.scoreline && (
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Expected Goals</p>
                        <p className="text-2xl font-bold">{prediction.expectedGoals.home}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Most Likely Scoreline</p>
                        <p className="text-2xl font-bold">{prediction.scoreline.home} - {prediction.scoreline.away}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Expected Goals</p>
                        <p className="text-2xl font-bold">{prediction.expectedGoals.away}</p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {prediction.rationale && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                    <p className="text-sm text-slate-700 dark:text-slate-300">{prediction.rationale}</p>
                    {prediction.rationaleSource === 'ai' && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Generated by AI</p>
                    )}
                  </div>
                )}

                {prediction.factors && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="font-medium mb-3">Key Factors</h4>
                    <FactorList factors={prediction.factors} homeTeam={match.home} awayTeam={match.away} />
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-500 dark:text-slate-400">Prediction data not available</p>
            )}
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
            <h3 className="text-lg font-semibold mb-4">Your Call</h3>
            {isFinished ? (
              <p className="text-slate-500 dark:text-slate-400">Match has finished. Predictions are locked.</p>
            ) : (
              <>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Button
                    variant={savedPick?.pick === 'home' ? 'default' : 'outline'}
                    onClick={() => save(matchId, 'home', prediction?.pick)}
                    disabled={isFinished}
                  >
                    {match.home.name} (Home)
                  </Button>
                  <Button
                    variant={savedPick?.pick === 'draw' ? 'default' : 'outline'}
                    onClick={() => save(matchId, 'draw', prediction?.pick)}
                    disabled={isFinished}
                  >
                    Draw
                  </Button>
                  <Button
                    variant={savedPick?.pick === 'away' ? 'default' : 'outline'}
                    onClick={() => save(matchId, 'away', prediction?.pick)}
                    disabled={isFinished}
                  >
                    {match.away.name} (Away)
                  </Button>
                </div>

                {savedPick && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg flex items-center justify-between">
                    <span className="text-sm">
                      Your pick: <strong className="capitalize">{savedPick.pick}</strong>
                      {prediction && (
                        <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                          (Model: {prediction.pick})
                        </span>
                      )}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => remove(matchId)}>
                      Remove
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}