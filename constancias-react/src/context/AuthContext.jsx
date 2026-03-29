import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken]     = useState(() => localStorage.getItem('uat_token') || '')
  const [usuario, setUsuario] = useState(() => JSON.parse(localStorage.getItem('uat_user') || 'null'))

  const login = useCallback((tok, user) => {
    setToken(tok)
    setUsuario(user)
    localStorage.setItem('uat_token', tok)
    localStorage.setItem('uat_user', JSON.stringify(user))
  }, [])

  const logout = useCallback(() => {
    setToken('')
    setUsuario(null)
    localStorage.removeItem('uat_token')
    localStorage.removeItem('uat_user')
  }, [])

  return (
    <AuthContext.Provider value={{ token, usuario, login, logout, isLoggedIn: !!token && !!usuario }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
