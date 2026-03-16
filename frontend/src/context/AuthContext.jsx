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

function persistSession(token, user) {
  if (token) {
    localStorage.setItem(STORAGE_TOKEN_KEY, token)
  } else {
    localStorage.removeItem(STORAGE_TOKEN_KEY)
  }
  if (user) {
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(STORAGE_USER_KEY)
  }
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const { token: storedToken, user: storedUser } = readStorage()

  const [token, setToken] = useState(storedToken)
  const [user, setUser] = useState(storedToken ? storedUser : null)

  const isLoggedIn = token !== null

  function login(data) {
    const newToken = extractToken(data)
    const newUser = extractUser(data)

    setToken(newToken)
    setUser(newUser)
    persistSession(newToken, newUser)
  }

  function logout() {
    setToken(null)
    setUser(null)
    persistSession(null, null)
  }

  function updateUser(nextUser) {
    setUser((prevUser) => {
      const mergedUser = { ...(prevUser ?? {}), ...(nextUser ?? {}) }
      persistSession(token, mergedUser)
      return mergedUser
    })
  }

  return (
    <AuthContext.Provider value={{ token, user, isLoggedIn, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
