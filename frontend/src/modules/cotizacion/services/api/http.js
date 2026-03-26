/**
 * Get API base URL from environment or default to '/api' (proxied by Vite)
 */
export function getApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL || '/api'
}

/**
 * Espera exponencialmente para reintentos
 */
function getBackoffDelay(attempt) {
  return Math.min(1000 * Math.pow(2, attempt), 10000) // max 10s
}

/**
 * Realiza request con reintentos automáticos
 */
async function fetchWithRetry(url, options, { maxRetries = 3, timeout = 30000 } = {}) {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return res;
    } catch (err) {
      lastError = err;

      // No reintentar si fue cancelado por el usuario
      if (err.name === 'AbortError') {
        throw err;
      }

      // Reintentar solo en errores de red
      if (attempt < maxRetries) {
        const delay = getBackoffDelay(attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Maneja respuestas de error HTTP
 */
async function handleErrorResponse(res) {
  const contentType = res.headers.get('content-type') || '';
  let errorMessage = `HTTP ${res.status}`;

  try {
    if (contentType.includes('application/json')) {
      const data = await res.json();
      errorMessage = data.message || data.error || errorMessage;
    } else {
      const text = await res.text();
      if (text) errorMessage = text;
    }
  } catch (err) {
    // Ignorar error al parsear
  }

  return new Error(errorMessage);
}

export async function apiGet(path, { signal, responseType = 'json', headers } = {}) {
  const url = `${getApiBaseUrl()}${path}`;

  const res = await fetchWithRetry(url, {
    method: 'GET',
    headers: headers || {},
    signal,
  });

  if (!res.ok) {
    throw await handleErrorResponse(res);
  }

  if (responseType === 'blob') {
    return res.blob();
  }

  return res.json();
}

export async function apiPost(path, body, { signal, headers, responseType = 'json' } = {}) {
  const url = `${getApiBaseUrl()}${path}`;

  const res = await fetchWithRetry(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {}),
    },
    body: JSON.stringify(body ?? {}),
    signal,
  });

  if (!res.ok) {
    throw await handleErrorResponse(res);
  }

  if (responseType === 'blob') {
    return res.blob();
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/pdf')) {
    return res.arrayBuffer();
  }

  return res.json();
}

export async function apiPut(path, body, { signal, headers, responseType = 'json' } = {}) {
  const url = `${getApiBaseUrl()}${path}`;

  const res = await fetchWithRetry(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {}),
    },
    body: JSON.stringify(body ?? {}),
    signal,
  });

  if (!res.ok) {
    throw await handleErrorResponse(res);
  }

  if (responseType === 'blob') {
    return res.blob();
  }

  return res.json();
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
