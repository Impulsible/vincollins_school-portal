// src/lib/auth-utils.ts
export function getCachedAuthState() {
  if (typeof window === 'undefined') {
    return { isAuthenticated: false }
  }
  try {
    const session = localStorage.getItem('sb-session')
    if (session) {
      const parsed = JSON.parse(session)
      return { isAuthenticated: !!parsed?.access_token }
    }
  } catch {
    // ignore
  }
  return { isAuthenticated: false }
}

export function getCachedHeaderUser() {
  if (typeof window === 'undefined') {
    return null
  }
  try {
    const cached = localStorage.getItem('user_profile')
    if (cached) {
      return JSON.parse(cached)
    }
  } catch {
    // ignore
  }
  return null
}

export function instantLogout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('sb-session')
    localStorage.removeItem('user_profile')
    window.location.href = '/portal'
  }
}