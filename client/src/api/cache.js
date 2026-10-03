const cache = new Map()

export function cached(key, loader) {
  if (cache.has(key)) {
    return cache.get(key)
  }

  const promise = loader().then(
    (result) => {
      cache.set(key, result)
      return result
    },
    (err) => {
      cache.delete(key)
      throw err
    }
  )

  cache.set(key, promise)
  return promise
}

export function clearCache(key) {
  if (key) {
    cache.delete(key)
  } else {
    cache.clear()
  }
}