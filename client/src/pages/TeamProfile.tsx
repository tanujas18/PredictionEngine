import { useParams, Link } from 'react-router-dom'
import { useFetch } from '@/hooks/useFetch'
import { getTeam } from '@/api/matches'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useFavourites } from '@/state/FavouritesProvider'
import ErrorState from '@/components/ErrorState'

function TeamProfileSkeleton() {
  return (
    <div className="page max-w-3xl">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Skeleton className="w-20 h-20 rounded-full" />
            <div>
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-4 w-32 mt-1" />
            </div>
          </div>
          <Skeleton className="h-10 w-24" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-32 mt-1" />
              </div>
            ))}
          </div>
          <div>
            <Skeleton className="h-5 w-32" />
            <div className="grid gap-2 sm:grid-cols-3 mt-3">
              {[...Array(7)].map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-5 w-16 mt-1" />
                </div>
              ))}
            </div>
          </div>
          <div className="border-t">
            <Skeleton className="h-5 w-40 mt-6" />
            <div className="space-y-2 mt-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-2">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-5 w-16" />
                  <div className="flex items-center gap-3 text-right">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="w-8 h-8 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t">
            <Skeleton className="h-5 w-40 mt-6" />
            <div className="space-y-2 mt-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-2">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                  <div className="flex items-center gap-3 text-right">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="w-8 h-8 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function TeamProfile() {
  const { id } = useParams<{ id: string }>()
  const { toggle, isFavourite } = useFavourites()

  const teamId = id ?? ''

  const { data: team, status, error, reload } = useFetch(
    () => {
      if (!teamId) return Promise.resolve(null)
      return getTeam(teamId)
    },
    [teamId]
  )

  const isFav = team ? isFavourite(team.id) : false

  if (status === 'loading') {
    return <TeamProfileSkeleton />
  }

  if (status === 'error' || !team) {
    return <ErrorState error={error} onRetry={reload} message={`No team found with ID "${teamId}"`} />
  }

  return (
    <div className="page max-w-3xl">
      <Link to="/teams" className="mb-6 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
        ← Back to Teams
      </Link>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
              {team.crest && (
                <img
                  src={team.crest}
                  alt={team.name}
                  className="w-full h-full object-cover"
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => { 
                    e.currentTarget.style.display = 'none'
                  }}
                />
              )}
              <div
                className="w-full h-full flex items-center justify-center text-white font-bold text-2xl absolute inset-0"
                style={{ backgroundColor: team.color || '#6366f1' }}
              >
                {team.monogram || team.short}
              </div>
            </div>
            <div>
              <CardTitle className="text-3xl">{team.name}</CardTitle>
              <p className="text-slate-500 dark:text-slate-400">{team.league}</p>
            </div>
          </div>
          <Button
            variant={isFav ? 'default' : 'outline'}
            onClick={() => toggle(team.id)}
          >
            {isFav ? '★ Starred' : '☆ Star'}
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium text-slate-500 dark:text-slate-400 mb-1">Country</h4>
              <p>{team.country}</p>
            </div>
            <div>
              <h4 className="font-medium text-slate-500 dark:text-slate-400 mb-1">Stadium</h4>
              <p>{team.stadium}</p>
            </div>
            <div>
              <h4 className="font-medium text-slate-500 dark:text-slate-400 mb-1">Manager</h4>
              <p>{team.manager}</p>
            </div>
            <div>
              <h4 className="font-medium text-slate-500 dark:text-slate-400 mb-1">Rating</h4>
              <p>{team.rating}</p>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">Last Season</h4>
            <div className="grid gap-2 sm:grid-cols-3 text-sm">
              <div><span className="text-slate-500 dark:text-slate-400">Position: </span><strong>{team.lastSeason.position}</strong></div>
              <div><span className="text-slate-500 dark:text-slate-400">Played: </span><strong>{team.lastSeason.played}</strong></div>
              <div><span className="text-slate-500 dark:text-slate-400">Won: </span><strong>{team.lastSeason.won}</strong></div>
              <div><span className="text-slate-500 dark:text-slate-400">Drawn: </span><strong>{team.lastSeason.drawn}</strong></div>
              <div><span className="text-slate-500 dark:text-slate-400">Lost: </span><strong>{team.lastSeason.lost}</strong></div>
              <div><span className="text-slate-500 dark:text-slate-400">GF: </span><strong>{team.lastSeason.gf}</strong></div>
              <div><span className="text-slate-500 dark:text-slate-400">GA: </span><strong>{team.lastSeason.ga}</strong></div>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
            <h3 className="text-lg font-semibold mb-4">Recent Results</h3>
            {team.results?.length > 0 ? (
              <div className="space-y-2">
                {team.results.slice(0, 5).map((match: any) => (
                  <div key={match.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded">
                    <div className="flex items-center gap-3">
                      <span
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: match.home?.color || '#6366f1' }}
                      >
                        {match.home?.monogram || match.home?.short}
                      </span>
                      <span>{match.home?.name}</span>
                    </div>
                    <span className="font-mono">{match.score?.home ?? '-'} - {match.score?.away ?? '-'}</span>
                    <div className="flex items-center gap-3 text-right">
                      <span>{match.away?.name}</span>
                      <span
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: match.away?.color || '#6366f1' }}
                      >
                        {match.away?.monogram || match.away?.short}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 dark:text-slate-400">No recent results</p>
            )}
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
            <h3 className="text-lg font-semibold mb-4">Upcoming Fixtures</h3>
            {team.fixtures?.length > 0 ? (
              <div className="space-y-2">
                {team.fixtures.slice(0, 5).map((match: any) => (
                  <Link key={match.id} to={`/match/${match.id}`} className="block">
                    <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <span
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: match.home?.color || '#6366f1' }}
                        >
                          {match.home?.monogram || match.home?.short}
                        </span>
                        <span>{match.home?.name}</span>
                      </div>
                      <time className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {new Date(match.kickoff).toLocaleDateString()}
                      </time>
                      <div className="flex items-center gap-3 text-right">
                        <span>{match.away?.name}</span>
                        <span
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: match.away?.color || '#6366f1' }}
                        >
                          {match.away?.monogram || match.away?.short}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 dark:text-slate-400">No upcoming fixtures</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}