import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { loginUser, registerUser } from '../api/auth'

/**
 * AuthContext
 * -----------
 * React Context = shared state available to many components
 * without passing props through every layer ("prop drilling").
 *
 * Here we store the JWT token after login so Dashboard can call protected APIs.
 */

type AuthContextValue = {
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const TOKEN_KEY = 'creditpilot_token'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    // Remember login across page refreshes (stored in the browser)
    return localStorage.getItem(TOKEN_KEY)
  })

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      async login(email, password) {
        const result = await loginUser(email, password)
        localStorage.setItem(TOKEN_KEY, result.access_token)
        setToken(result.access_token)
      },
      async register(name, email, password) {
        await registerUser({ name, email, password })
        // After signup, log them in immediately
        const result = await loginUser(email, password)
        localStorage.setItem(TOKEN_KEY, result.access_token)
        setToken(result.access_token)
      },
      logout() {
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
      },
    }),
    [token],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return ctx
}
