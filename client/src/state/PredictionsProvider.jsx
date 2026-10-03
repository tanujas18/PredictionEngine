import { createContext, useContext, useReducer, useMemo, useCallback, useEffect } from 'react'
import { predictionsReducer, loadInitialPredictions } from './predictionsReducer'

const PredictionsContext = createContext(null)

export function PredictionsProvider({ children }) {
  const [predictions, dispatch] = useReducer(predictionsReducer, null, loadInitialPredictions)

  useEffect(() => {
    localStorage.setItem('predictions', JSON.stringify(predictions))
  }, [predictions])

  const save = (matchId, pick, modelPick) => {
    dispatch({ type: 'save', payload: { matchId, pick, modelPick } })
  }

  const remove = (matchId) => {
    dispatch({ type: 'remove', payload: { matchId } })
  }

  const clear = () => {
    dispatch({ type: 'clear' })
  }

  const pickFor = useCallback((matchId) => {
    return predictions.find((p) => p.matchId === matchId)
  }, [predictions])

  const value = useMemo(
    () => ({ predictions, save, remove, clear, pickFor }),
    [predictions, pickFor]
  )

  return (
    <PredictionsContext.Provider value={value}>
      {children}
    </PredictionsContext.Provider>
  )
}

export function usePredictions() {
  const context = useContext(PredictionsContext)
  if (!context) {
    throw new Error('usePredictions must be used within a PredictionsProvider')
  }
  return context
}