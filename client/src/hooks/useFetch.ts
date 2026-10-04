import { useState, useEffect, useCallback, useRef } from 'react'

type FetchStatus = 'idle' | 'loading' | 'success' | 'error'

interface UseFetchResult<T> {
  data: T | null
  status: FetchStatus
  error: Error | null
  reload: () => void
}

export function useFetch<T>(
  fetcher: () => Promise<T>,
  deps: React.DependencyList = []
): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [status, setStatus] = useState<FetchStatus>('idle')
  const [error, setError] = useState<Error | null>(null)
  const [nonce, setNonce] = useState(0)

  const activeRef = useRef(true)
  const fetcherRef = useRef(fetcher)

  useEffect(() => {
    fetcherRef.current = fetcher
  }, [fetcher])

  const execute = useCallback(async () => {
    activeRef.current = true
    setStatus('loading')
    setError(null)

    try {
      const result = await fetcherRef.current()
      if (activeRef.current) {
        setData(result)
        setStatus('success')
      }
    } catch (err) {
      if (activeRef.current) {
        setError(err as Error)
        setStatus('error')
      }
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react/set-state-in-effect
    execute()

    return () => {
      activeRef.current = false
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execute, nonce, ...deps])

  const reload = useCallback(() => {
    setNonce((n) => n + 1)
  }, [])

  return { data, status, error, reload }
}