import { useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const API = 'https://constanciasgenerador-production.up.railway.app/api'

export function useApi() {
  const { token, logout } = useAuth()
  const toast = useToast()

  const request = useCallback(async (path, opts = {}) => {
    const r = await fetch(`${API}${path}`, {
      ...opts,
      headers: {
        'Authorization': `Bearer ${token}`,
        ...(opts.headers || {}),
      },
    })
    if (r.status === 401) { toast('Tu sesión ya no es válida o el backend rechazó la petición.', 'error'); return null }
    return r
  }, [token, toast])

  const requestJSON = useCallback(async (path, opts = {}) => {
    const r = await request(path, opts)
    if (!r) return null
    const d = await r.json()
    if (!r.ok) { toast(d.detail || 'Error', 'error'); return null }
    return d
  }, [request, toast])

  return { request, requestJSON, API }
}
