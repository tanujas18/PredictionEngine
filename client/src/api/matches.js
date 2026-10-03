import { request } from './client'
import { cached } from './cache'

export async function getMatches(filters = {}) {
  const params = new URLSearchParams()
  if (filters.league && filters.league !== 'all') params.set('league', filters.league)
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.q) params.set('q', filters.q)
  const query = params.toString()
  return request(`/api/matches${query ? `?${query}` : ''}`)
}

export async function getMatch(id) {
  return cached(`match:${id}`, () => request(`/api/matches/${id}`))
}

export async function getTeams() {
  return request('/api/teams')
}

export async function getTeam(id) {
  return cached(`team:${id}`, () => request(`/api/teams/${id}`))
}

export async function getPrediction(id) {
  return cached(`prediction:${id}`, () => request(`/api/predict/${id}`))
}