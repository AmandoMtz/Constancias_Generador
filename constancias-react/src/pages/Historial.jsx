import { useState, useEffect, useCallback } from 'react'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../context/AuthContext'

const BADGE = {
  completado: 'badge-green',
  error:      'badge-red',
  procesando: 'badge-yellow',
  pendiente:  'badge-blue',
}

export default function Historial() {
  const { requestJSON, request, API } = useApi()
  const { token } = useAuth()
  const [envios, setEnvios] = useState([])
  const [eliminandoId, setEliminandoId] = useState(null)

  const cargar = useCallback(async () => {
    const d = await requestJSON('/envios/')
    if (d) setEnvios(d)
  }, [requestJSON])

  useEffect(() => { cargar() }, [cargar])

  async function eliminarEnvio(id) {
    const ok = window.confirm(`¿Deseas borrar el registro #${id} del historial? Esta acción también elimina su lote y su ZIP.`)
    if (!ok) return

    setEliminandoId(id)
    const r = await request(`/envios/${id}`, { method: 'DELETE' })
    if (!r) {
      setEliminandoId(null)
      return
    }

    const data = await r.json().catch(() => ({}))
    if (!r.ok) {
      alert(data.detail || 'No se pudo eliminar el envío.')
      setEliminandoId(null)
      return
    }

    setEnvios(prev => prev.filter(e => e.id !== id))
    setEliminandoId(null)
  }

  return (
    <div className="panel">
      <div className="panel-title">Historial de Envíos</div>
      <div className="actions" style={{ marginTop: 0, marginBottom: 14 }}>
        <div className="spacer" />
        <button className="btn btn-ghost btn-sm" onClick={cargar}>↻ Actualizar</button>
      </div>

      {envios.length === 0 ? (
        <p className="text-muted">Sin envíos registrados.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>#</th><th>Plantilla</th><th>Método</th><th>Estado</th>
              <th>Total</th><th>Enviados</th><th>Errores</th><th>Fecha</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {envios.map(e => (
              <tr key={e.id}>
                <td style={{ color: '#aaa', fontSize: 12 }}>{e.id}</td>
                <td>{e.plantilla_id}</td>
                <td><span className="badge badge-blue">{e.metodo}</span></td>
                <td>
                  <span className={`badge ${BADGE[e.estado] || 'badge-blue'}`}>
                    {e.estado}
                  </span>
                </td>
                <td>{e.total}</td>
                <td style={{ color: 'var(--verde)', fontWeight: 600 }}>{e.enviados}</td>
                <td style={{ color: e.errores ? 'var(--rojo)' : '#888' }}>{e.errores}</td>
                <td style={{ fontSize: 12, color: '#888' }}>
                  {e.created_at?.substring(0, 16).replace('T', ' ') || '—'}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {e.estado === 'completado' && (
                      <a
                        href={`${API}/constancias/lote/${e.id}/zip?token=${token}`}
                        className="btn btn-ghost btn-sm"
                        style={{ textDecoration: 'none' }}
                      >
                        ⬇ ZIP
                      </a>
                    )}
                    <button
                      className="btn btn-danger btn-sm"
                      type="button"
                      disabled={eliminandoId === e.id}
                      onClick={() => eliminarEnvio(e.id)}
                    >
                      {eliminandoId === e.id ? 'Borrando...' : '🗑 Borrar'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
