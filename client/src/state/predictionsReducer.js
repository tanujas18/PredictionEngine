export function predictionsReducer(state, action) {
  switch (action.type) {
    case 'save': {
      const { matchId, pick, modelPick } = action.payload
      const filtered = state.filter((p) => p.matchId !== matchId)
      const newPick = {
        matchId,
        pick,
        modelPick,
        savedAt: Date.now(),
      }
      return [newPick, ...filtered]
    }
    case 'remove': {
      const { matchId } = action.payload
      return state.filter((p) => p.matchId !== matchId)
    }
    case 'clear':
      return []
    default:
      throw new Error(`Unknown action type: ${action.type}`)
  }
}

export function loadInitialPredictions() {
  try {
    const stored = localStorage.getItem('predictions')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
  }
  return []
}