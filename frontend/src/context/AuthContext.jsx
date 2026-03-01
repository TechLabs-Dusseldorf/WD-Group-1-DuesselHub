import { createContext, useContext, useState } from 'react'

const STORAGE_TOKEN_KEY = 'authToken'
const STORAGE_USER_KEY = 'authUser'

function readStorage() {
  try {
    const token = localStorage.getItem(STORAGE_TOKEN_KEY) ?? null
    const raw = localStorage.getItem(STORAGE_USER_KEY)
    const user = raw ? JSON.parse(raw) : null
    return { token, user }
  } catch {
    return { token: null, user: null }
  }
}

function extractToken(data) {
  return data?.token ?? data?.accessToken ?? data?.data?.token ?? null
}

function extractUser(data) {
  return data?.user ?? data?.data?.user ?? null
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const { token: storedToken, user: storedUser } = readStorage()

  const [token, setToken] = useState(storedToken)
  const [user, setUser] = useState(storedUser)

  const isLoggedIn = token !== null || user !== null

  function login(data) {
    const newToken = extractToken(data)
    const newUser = extractUser(data)

    setToken(newToken)
    setUser(newUser)

    if (newToken) {
      localStorage.setItem(STORAGE_TOKEN_KEY, newToken)
    } else {
      localStorage.removeItem(STORAGE_TOKEN_KEY)
    }
    if (newUser) {
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(newUser))
    } else {
      localStorage.removeItem(STORAGE_USER_KEY)
    }
  }

  function logout() {
    setToken(null)
    setUser(null)
    localStorage.removeItem(STORAGE_TOKEN_KEY)
    localStorage.removeItem(STORAGE_USER_KEY)
  }

  return (
    <AuthContext.Provider value={{ token, user, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
