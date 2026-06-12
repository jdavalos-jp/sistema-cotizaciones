import { useEffect, useState } from 'react'
import { getCurrentUser } from './auth.js'

export function useAuthUser() {
  const [user, setUser] = useState(() => getCurrentUser())

  useEffect(() => {
    const syncUser = () => setUser(getCurrentUser())

    window.addEventListener('auth-change', syncUser)
    window.addEventListener('storage', syncUser)

    return () => {
      window.removeEventListener('auth-change', syncUser)
      window.removeEventListener('storage', syncUser)
    }
  }, [])

  return user
}
