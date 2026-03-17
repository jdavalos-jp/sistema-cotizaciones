const DEFAULT_BASE_URL = 'http://localhost:3001'

export function getApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL
}

export async function apiGet(path, { signal } = {}) {
  const url = `${getApiBaseUrl()}${path}`
  const res = await fetch(url, { method: 'GET', signal })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `HTTP ${res.status}`)
  }
  return res.json()
}

export async function apiPost(path, body, { signal, headers } = {}) {
  const url = `${getApiBaseUrl()}${path}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {}),
    },
    body: JSON.stringify(body ?? {}),
    signal,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `HTTP ${res.status}`)
  }

  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/pdf')) {
    return res.arrayBuffer()
  }

  return res.json()
}
