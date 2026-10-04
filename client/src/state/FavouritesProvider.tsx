import { createContext, useContext, useMemo, useCallback, ReactNode } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'

interface FavouritesContextType {
  favourites: string[]
  toggle: (teamId: string) => void
  isFavourite: (teamId: string) => boolean
}

const FavouritesContext = createContext<FavouritesContextType | null>(null)

interface FavouritesProviderProps {
  children: ReactNode
}

export function FavouritesProvider({ children }: FavouritesProviderProps) {
  const [favourites, setFavourites] = useLocalStorage<string[]>('favourite-teams', [])

  const toggle = useCallback((teamId: string) => {
    setFavourites((prev) =>
      prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]
    )
  }, [setFavourites])

  const isFavourite = useCallback(
    (teamId: string) => favourites.includes(teamId),
    [favourites]
  )

  const value = useMemo(
    () => ({ favourites, toggle, isFavourite }),
    [favourites, toggle, isFavourite]
  )

  return (
    <FavouritesContext.Provider value={value}>
      {children}
    </FavouritesContext.Provider>
  )
}

export function useFavourites(): FavouritesContextType {
  const context = useContext(FavouritesContext)
  if (!context) {
    throw new Error('useFavourites must be used within a FavouritesProvider')
  }
  return context
}