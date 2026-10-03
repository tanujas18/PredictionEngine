import { createContext, useContext, useMemo, useCallback } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'

const FavouritesContext = createContext(null)

export function FavouritesProvider({ children }) {
  const [favourites, setFavourites] = useLocalStorage('favourite-teams', [])

  const toggle = useCallback((teamId) => {
    setFavourites((prev) =>
      prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]
    )
  }, [setFavourites])

  const isFavourite = useCallback(
    (teamId) => favourites.includes(teamId),
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

export function useFavourites() {
  const context = useContext(FavouritesContext)
  if (!context) {
    throw new Error('useFavourites must be used within a FavouritesProvider')
  }
  return context
}