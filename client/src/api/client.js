// Use VITE_API_URL from environment, fallback to relative path for Railway deployment
const API_BASE_URL = import.meta.env.VITE_API_URL || ''

export async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`
  
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(error.message || 'Request failed')
  }

  if (res.status === 204) return null
  return res.json()
}