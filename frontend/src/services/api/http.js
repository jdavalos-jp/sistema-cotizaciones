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
    let timeoutId;
    try {
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), timeout);

      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return res;
    } catch (err) {
      if (timeoutId) clearTimeout(timeoutId);
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

  // Detectar si el body es FormData
  const isFormData = body instanceof FormData;

  const requestOptions = {
    method: 'POST',
    signal,
  };

  // Si es FormData, NO setear Content-Type (navegador lo hace automáticamente)
  // Si es JSON, setear Content-Type
  if (!isFormData) {
    requestOptions.headers = {
      'Content-Type': 'application/json',
      ...(headers || {}),
    };
    requestOptions.body = JSON.stringify(body ?? {});
  } else {
    requestOptions.headers = headers || {};
    requestOptions.body = body; // FormData sin stringify
  }

  const res = await fetchWithRetry(url, requestOptions);

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
  const url = `${getApiBaseUrl()}${path}`;

  const res = await fetchWithRetry(url, {
    method: 'PATCH',
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

export async function apiDelete(path, { signal, headers, responseType = 'json' } = {}) {
  const url = `${getApiBaseUrl()}${path}`;

  const res = await fetchWithRetry(url, {
    method: 'DELETE',
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
