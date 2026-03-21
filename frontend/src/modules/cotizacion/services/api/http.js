const DEFAULT_BASE_URL = 'http://localhost:3001'

export function getApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL
}

export async function apiGet(path, { signal, responseType = 'json', headers } = {}) {
  const url = `${getApiBaseUrl()}${path}`
  const res = await fetch(url, {
    method: 'GET',
    headers: headers || {},
    signal,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `HTTP ${res.status}`)
  }

  if (responseType === 'blob') {
    return res.blob()
  }

  return res.json()
}

export async function apiPost(path, body, { signal, headers, responseType = 'json' } = {}) {
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

  if (responseType === 'blob') {
    return res.blob()
  }

  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/pdf')) {
    return res.arrayBuffer()
  }

  return res.json()
}

export async function apiPut(path, body, { signal, headers, responseType = 'json' } = {}) {
  const url = `${getApiBaseUrl()}${path}`
  const res = await fetch(url, {
    method: 'PUT',
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

  if (responseType === 'blob') {
    return res.blob()
  }

  return res.json()
}

export async function apiPatch(path, body, { signal, headers, responseType = 'json' } = {}) {
  const url = `${getApiBaseUrl()}${path}`
  const res = await fetch(url, {
    method: 'PATCH',
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

  if (responseType === 'blob') {
    return res.blob()
  }

  return res.json()
}

export async function apiDelete(path, { signal, headers, responseType = 'json' } = {}) {
  const url = `${getApiBaseUrl()}${path}`
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {}),
    },
    signal,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `HTTP ${res.status}`)
  }

  if (responseType === 'blob') {
    return res.blob()
  }

  return res.json()
}
