import { useMemo } from 'react'
import { useFetch } from '@/hooks/useFetch'
import { getMatches } from '@/api/matches'
import { usePredictions } from '@/state/PredictionsProvider'
import { settle, summarise } from '@/lib/scoring'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'

interface StatTileProps {
  label: string
  value: string | number
  subLabel?: string
  className?: string
}

function StatTile({ label, value, subLabel, className = '' }: StatTileProps) {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-3xl font-bold">{value}</p>
        {subLabel && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subLabel}</p>}
      </CardContent>
    </Card>
  )
}

interface PickRowProps {
  prediction: any
  match: any
  onRemove: (matchId: string) => void
}

function PickRow({ prediction, match, onRemove }: PickRowProps) {
  const status = settle(prediction, match)
  const mHit = modelHit(prediction, match)

  const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string; color: string }> = {
    hit: { variant: 'default', label: 'Hit', color: 'text-green-600 dark:text-green-400' },
    miss: { variant: 'destructive', label: 'Miss', color: 'text-red-600 dark:text-red-400' },
    pending: { variant: 'secondary', label: 'Pending', color: 'text-amber-600 dark:text-amber-400' },
  }

  const cfg = statusConfig[status]

  if (!match) {
    return (
      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
        <div>
          <p className="font-medium">Match {prediction.matchId}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading...</p>
        </div>
        <Badge variant="secondary">Unknown</Badge>
      </div>
    )
  }

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(match.kickoff))

  return (
    <div className="flex items-center justify-between gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="flex items-center gap-2 w-24 flex-shrink-0">
          {match.home.crest && (
            <img
              src={match.home.crest}
              alt={match.home.name}
              className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          )}
          {!match.home.crest && (
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: match.home?.color || '#6366f1' }}
            >
              {match.home?.monogram || match.home?.short}
            </span>
          )}
          {match.away.crest && (
            <img
              src={match.away.crest}
              alt={match.away.name}
              className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          )}
          {!match.away.crest && (
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: match.away?.color || '#6366f1' }}
            >
              {match.away?.monogram || match.away?.short}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="font-medium truncate">{match.home.name} vs {match.away.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {match.league} · {formattedDate}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="text-right hidden sm:block">
          <p className="text-xs text-slate-500 dark:text-slate-400">Your pick</p>
          <p className="font-medium capitalize">{prediction.pick}</p>
        </div>
        <Badge variant={cfg.variant} className={cfg.color}>
          {cfg.label}
        </Badge>
        {mHit !== null && (
          <Badge variant={mHit ? 'default' : 'destructive'} className="text-xs">
            Model: {mHit ? 'Hit' : 'Miss'}
          </Badge>
        )}
        <Button variant="ghost" size="sm" onClick={() => onRemove(prediction.matchId)}>
          Remove
        </Button>
      </div>
    </div>
  )
}

function modelHit(saved: any, match: any): boolean | null {
  if (!match || match.status !== 'finished' || !saved.modelPick) {
    return null
  }

  const resultMap: Record<string, string> = { home: 'home', away: 'away', draw: 'draw' }
  const matchResult = resultMap[match.result] ?? match.result
  return saved.modelPick === matchResult
}

export default function MyPredictions() {
  const { predictions, remove } = usePredictions()

  const { data, status: fetchStatus, error, reload } = useFetch(getMatches, [])

  const matchesById = useMemo(() => {
    const map: Record<string, any> = {}
    for (const m of data?.matches ?? []) {
      map[m.id] = m
    }
    return map
  }, [data?.matches])

  const stats = useMemo(() => summarise(predictions, matchesById), [predictions, matchesById])

  const grouped = useMemo(() => {
    const groups: { all: any[]; pending: any[]; settled: any[] } = { 
      all: predictions, 
      pending: [], 
      settled: [] 
    }
    for (const p of predictions) {
      const match = matchesById[p.matchId]
      const s = settle(p, match)
      if (s === 'pending') groups.pending.push(p)
      else groups.settled.push(p)
    }
    return groups
  }, [predictions, matchesById])

  if (fetchStatus === 'loading') {
    return (
      <div className="page">
        <h1 className="text-2xl font-bold mb-6">My Predictions</h1>
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}><CardContent className="p-4"><Skeleton className="h-6 w-24" /><Skeleton className="h-8 w-16 mt-2" /></CardContent></Card>
          ))}
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32 mt-1" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (fetchStatus === 'error') {
    return (
      <div className="page">
        <h1 className="text-2xl font-bold mb-6">My Predictions</h1>
        <div className="error">Error: {error?.message}</div>
        <Button variant="outline" onClick={reload} className="mt-2">Retry</Button>
      </div>
    )
  }

  return (
    <div className="page">
      <h1 className="text-2xl font-bold mb-6">My Predictions</h1>

      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <StatTile label="Your Accuracy" value={`${stats.yourAccuracy}%`} subLabel={`${stats.yourHits}/${stats.settled} settled`} />
        <StatTile label="Model Accuracy" value={`${stats.modelAccuracy}%`} subLabel={`${stats.modelHits}/${stats.settled} settled`} />
        <StatTile label="Pending" value={stats.pending} subLabel={`${stats.total} total picks`} />
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="all">All ({grouped.all.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({grouped.pending.length})</TabsTrigger>
          <TabsTrigger value="settled">Settled ({grouped.settled.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3">
          {grouped.all.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No predictions yet</p>
          ) : (
            grouped.all.map((p) => (
              <PickRow key={p.matchId} prediction={p} match={matchesById[p.matchId]} onRemove={remove} />
            ))
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-3">
          {grouped.pending.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No pending predictions</p>
          ) : (
            grouped.pending.map((p) => (
              <PickRow key={p.matchId} prediction={p} match={matchesById[p.matchId]} onRemove={remove} />
            ))
          )}
        </TabsContent>

        <TabsContent value="settled" className="space-y-3">
          {grouped.settled.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No settled predictions</p>
          ) : (
            grouped.settled.map((p) => (
              <PickRow key={p.matchId} prediction={p} match={matchesById[p.matchId]} onRemove={remove} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}