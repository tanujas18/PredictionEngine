import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useFetch } from '@/hooks/useFetch'
import { getMatches } from '@/api/matches'
import MatchCard from '@/components/MatchCard'
import EmptyState from '@/components/EmptyState'
import ErrorState from '@/components/ErrorState'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

function setParam(searchParams: URLSearchParams, key: string, value: string | null): string {
  const params = new URLSearchParams(searchParams)
  if (value === 'all' || value === '' || value == null) {
    params.delete(key)
  } else {
    params.set(key, value)
  }
  return params.toString()
}

function MatchCardSkeleton() {
  return (
    <Card className="border border-slate-200 dark:border-slate-700 rounded-2xl">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-8 w-8" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
      </CardContent>
    </Card>
  )
}

const confidenceOrder = { high: 3, medium: 2, low: 1, undefined: 0 }

export default function Matches() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [leagues, setLeagues] = useState<string[]>([])
  const [sort, setSort] = useState('kickoff')

  const league = searchParams.get('league') || 'all'
  const status = searchParams.get('status') || 'all'
  const q = searchParams.get('q') || ''

  const { data, status: fetchStatus, error, reload } = useFetch<any>(
    () => getMatches({}),
    []
  )

  const allMatches = useMemo(() => (data?.matches ?? []) as any[], [data?.matches])
  const fetchedLeagues = (data?.leagues ?? []) as string[]

  if (fetchedLeagues.length > 0 && leagues.length === 0) {
    setLeagues(fetchedLeagues)
  }

  const visibleMatches = useMemo(() => {
    let filtered = allMatches

    if (league !== 'all') {
      filtered = filtered.filter((m: any) => m.league === league)
    }
    if (status !== 'all') {
      filtered = filtered.filter((m: any) => m.status === status)
    }
    if (q) {
      const needle = q.toLowerCase()
      filtered = filtered.filter(
        (m: any) =>
          m.home.name.toLowerCase().includes(needle) ||
          m.away.name.toLowerCase().includes(needle) ||
          m.league.toLowerCase().includes(needle)
      )
    }

    if (sort === 'kickoff') {
      filtered.sort((a: any, b: any) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime())
    } else if (sort === 'confidence') {
      filtered.sort((a: any, b: any) => {
        const ca = confidenceOrder[a.model?.confidence as keyof typeof confidenceOrder] ?? 0
        const cb = confidenceOrder[b.model?.confidence as keyof typeof confidenceOrder] ?? 0
        if (cb !== ca) return cb - ca
        return new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime()
      })
    }

    return filtered
  }, [allMatches, league, status, q, sort])

  const handleLeagueChange = (value: string) => {
    setSearchParams(setParam(searchParams, 'league', value))
  }

  const handleStatusChange = (value: string) => {
    setSearchParams(setParam(searchParams, 'status', value))
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchParams(setParam(searchParams, 'q', value))
  }

  const handleClearFilters = () => {
    setSearchParams('')
  }

  const hasActiveFilters = league !== 'all' || status !== 'all' || q !== ''

  // Calculate stats
  const totalMatches = allMatches.length
  const upcomingCount = allMatches.filter((m: any) => m.status === 'upcoming').length
  const finishedCount = allMatches.filter((m: any) => m.status === 'finished').length
  const leagueCount = leagues.length

  return (
    <div className="-mx-10 -my-10 min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="relative mb-8 rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-purple-600 p-8 lg:p-12 shadow-xl">
          <div className="relative z-10">
            <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-3">FIXTURES</p>
            <h1 className="text-3xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              Every match, with <span className="italic font-serif">a call on it</span>
            </h1>
            <p className="text-blue-100 text-sm lg:text-base max-w-2xl mb-6 leading-relaxed">
              Probabilities come from squad rating, recent form and home advantage. 
              Open a match for the full reasoning — then make your own call and see who ends up closer.
            </p>
            
            {/* Stats Badges */}
            <div className="flex flex-wrap gap-2.5">
              <div className="px-4 py-2.5 rounded-full border-2 border-white/20 bg-white/10 backdrop-blur-sm">
                <span className="text-white font-bold text-lg">{totalMatches}</span>
                <span className="text-blue-100 ml-1.5 text-sm">fixtures</span>
              </div>
              <div className="px-4 py-2.5 rounded-full border-2 border-white/20 bg-white/10 backdrop-blur-sm">
                <span className="text-white font-bold text-lg">{upcomingCount}</span>
                <span className="text-blue-100 ml-1.5 text-sm">upcoming</span>
              </div>
              <div className="px-4 py-2.5 rounded-full border-2 border-white/20 bg-white/10 backdrop-blur-sm">
                <span className="text-white font-bold text-lg">{finishedCount}</span>
                <span className="text-blue-100 ml-1.5 text-sm">already played</span>
              </div>
              <div className="px-4 py-2.5 rounded-full border-2 border-white/20 bg-white/10 backdrop-blur-sm">
                <span className="text-white font-bold text-lg">{leagueCount}</span>
                <span className="text-blue-100 ml-1.5 text-sm">leagues</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                League
              </label>
              <Select value={league} onValueChange={handleLeagueChange}>
                <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                  <SelectValue placeholder="All leagues" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All leagues</SelectItem>
                  <SelectSeparator />
                  {leagues.map((leagueName) => (
                    <SelectItem key={leagueName} value={leagueName}>
                      {leagueName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                Status
              </label>
              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="finished">Finished</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                Sort
              </label>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kickoff">Kick-off</SelectItem>
                  <SelectItem value="confidence">Model Confidence</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                Search
              </label>
              <Input
                type="search"
                placeholder="Team or league..."
                value={q}
                onChange={handleSearchChange}
                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              {visibleMatches.length} of {allMatches.length} matches
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-white dark:hover:bg-slate-900 rounded-lg transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {fetchStatus === 'loading' && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <MatchCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {fetchStatus === 'error' && <ErrorState error={error} onRetry={reload} />}

        {/* Matches Grid */}
        {fetchStatus === 'success' && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
            {visibleMatches.length === 0 && <EmptyState message="No matches found" />}
          </>
        )}
      </div>
    </div>
  )
}
