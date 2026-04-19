/**
 * In dev, default to same-origin `/api` so Vite can proxy to the backend (see vite.config.js).
 * Set `VITE_API_URL=http://localhost:5000` only if you need to bypass the proxy.
 * An empty `VITE_API_URL=` in .env would wrongly resolve to ""; we treat that as unset.
 */
export function getApiBase() {
  const raw = import.meta.env.VITE_API_URL
  const trimmed = typeof raw === 'string' ? raw.trim() : ''
  if (trimmed !== '') {
    return trimmed.replace(/\/$/, '')
  }
  if (import.meta.env.DEV) {
    // Default API port matches backend/server/.env PORT (5050) to avoid clashing with other apps on 5000.
    return 'http://127.0.0.1:5050'
  }
  return ''
}

function requestUrl(path) {
  const base = getApiBase()
  if (!base) return path
  return `${base}${path}`
}

/**
 * @param {string} path - begins with /
 * @param {RequestInit} [options]
 */
export async function apiJson(path, options = {}) {
  const res = await fetch(requestUrl(path), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    return {
      ok: false,
      error: data.error || `${res.status} ${res.statusText}`,
      status: res.status,
    }
  }
  return { ok: true, ...data }
}
