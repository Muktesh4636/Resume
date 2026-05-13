import { createContext, useCallback, useContext, useEffect, useState } from 'react'

export type GoogleUser = {
  email: string
  name: string
  picture: string
  sub: string
}

type AuthState =
  | { status: 'idle' }
  | { status: 'logged_in'; user: GoogleUser }

type AuthContextValue = {
  auth: AuthState
  login: (user: GoogleUser) => void
  logout: () => void
}

const AUTH_KEY = 'resume-studio:google-user'

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(() => {
    try {
      const raw = localStorage.getItem(AUTH_KEY)
      if (raw) return { status: 'logged_in', user: JSON.parse(raw) as GoogleUser }
    } catch {
      // ignore malformed stored data
    }
    return { status: 'idle' }
  })

  useEffect(() => {
    if (auth.status === 'logged_in') {
      localStorage.setItem(AUTH_KEY, JSON.stringify(auth.user))
    } else {
      localStorage.removeItem(AUTH_KEY)
    }
  }, [auth])

  const login = useCallback((user: GoogleUser) => {
    setAuth({ status: 'logged_in', user })
  }, [])

  const logout = useCallback(() => {
    setAuth({ status: 'idle' })
  }, [])

  return <AuthContext.Provider value={{ auth, login, logout }}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
