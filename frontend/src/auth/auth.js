import { apiGet, apiPost } from '../services/api/http.js'

const USER_STORAGE_KEY = 'cotizaciones_auth_user'
const TOKEN_STORAGE_KEY = 'cotizaciones_auth_token'

function saveSession({ token, usuario }) {
  const sessionUser = {
    idUsuario: usuario.idUsuario,
    name: usuario.nombre,
    email: usuario.email,
    role: usuario.rol,
  }

  localStorage.setItem(TOKEN_STORAGE_KEY, token)
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(sessionUser))
  window.dispatchEvent(new Event('auth-change'))

  return sessionUser
}

export async function loginWithBackend(email, password) {
  const response = await apiPost('/auth/login', { email, password }, { skipAuth: true })
  return saveSession(response.data)
}

export async function refreshCurrentUser() {
  const response = await apiGet('/auth/me')
  const usuario = response.data
  const currentToken = getAuthToken()

  if (!currentToken) return null

  return saveSession({ token: currentToken, usuario })
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY)
    return null
  }
}

export function logout() {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(USER_STORAGE_KEY)
  window.dispatchEvent(new Event('auth-change'))
}

export function canAccessRoute(user, allowedRoles) {
  if (!user) return false
  if (!allowedRoles || allowedRoles.length === 0) return true
  return allowedRoles.includes(user.role)
}
