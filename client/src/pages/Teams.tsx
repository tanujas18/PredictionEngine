import { Link } from 'react-router-dom'
import { useFetch } from '@/hooks/useFetch'
import { getTeams } from '@/api/matches'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useFavourites } from '@/state/FavouritesProvider'
import EmptyState from '@/components/EmptyState'
import ErrorState from '@/components/ErrorState'

function TeamCardSkeleton() {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex flex-col items-center text-center gap-3">
        <div className="flex items-center justify-center gap-2 w-full">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="text-left">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24 mt-1" />
          </div>
        </div>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  )
}

export default function Teams() {
  const { toggle, isFavourite } = useFavourites()
  const { data, status, error, reload } = useFetch(getTeams, [])

  const teams = data?.teams ?? []

  if (status === 'loading') {
    return (
      <div className="page">
        <h1 className="mb-6">Teams</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <TeamCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return <ErrorState error={error} onRetry={reload} />
  }

  return (
    <div className="page">
      <h1 className="mb-6">Teams</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
{teams.map((team) => (
            <Link key={team.id} to={`/teams/${team.id}`} className="block">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                  <div className="flex items-center justify-center gap-2 w-full">
                    <img
                      src={team.crest}
                      alt={team.name}
                      className="w-12 h-12 rounded-full flex-shrink-0 object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <span
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg hidden"
                      style={{ backgroundColor: team.color }}
                    >
                      {team.monogram}
                    </span>
                    <div className="text-left">
                      <p className="font-semibold">{team.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{team.league}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.preventDefault()
                      toggle(team.id)
                    }}
                  >
                    {isFavourite(team.id) ? '★ Starred' : '☆ Star'}
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
      </div>
      {teams.length === 0 && <EmptyState message="No teams found" />}
    </div>
  )
}