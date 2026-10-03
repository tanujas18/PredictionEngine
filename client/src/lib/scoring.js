export function settle(saved, match) {
  if (!match || match.status !== 'finished') {
    return 'pending'
  }

  const resultMap = {
    home: 'home',
    away: 'away',
    draw: 'draw',
  }

  const matchResult = resultMap[match.result] ?? match.result

  if (saved.pick === matchResult) {
    return 'hit'
  }
  return 'miss'
}

export function modelHit(saved, match) {
  if (!match || match.status !== 'finished' || !saved.modelPick) {
    return null
  }

  const resultMap = {
    home: 'home',
    away: 'away',
    draw: 'draw',
  }

  const matchResult = resultMap[match.result] ?? match.result

  return saved.modelPick === matchResult
}

export function summarise(predictions, matchesById) {
  let total = 0
  let yourHits = 0
  let modelHits = 0
  let settled = 0

  for (const p of predictions) {
    const match = matchesById[p.matchId]
    if (!match || match.status !== 'finished') continue

    settled++
    total++

    const result = settle(p, match)
    if (result === 'hit') yourHits++

    const mHit = modelHit(p, match)
    if (mHit) modelHits++
  }

  return {
    total,
    settled,
    pending: predictions.length - settled,
    yourAccuracy: settled > 0 ? Math.round((yourHits / settled) * 100) : 0,
    modelAccuracy: settled > 0 ? Math.round((modelHits / settled) * 100) : 0,
    yourHits,
    modelHits,
  }
}