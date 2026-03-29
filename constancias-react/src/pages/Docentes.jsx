import { useState, useEffect, useCallback } from 'react'
import { useApi } from '../hooks/useApi'
import { useToast } from '../context/ToastContext'
import Modal from '../components/Modal'

export default function Docentes() {
  const { request, requestJSON } = useApi()
  const toast = useToast()
  const [docentes, setDocentes]   = useState([])
  const [busqueda, setBusqueda]   = useState('')
  const [showAdd, setShowAdd]     = useState(false)
  const [showImp, setShowImp]     = useState(false)
  const [form, setForm] = useState({ nombre: '', email: '', cargo: '', departamento: '' })
  const [impFile, setImpFile]     = useState(null)
  const [impLabel, setImpLabel]   = useState('Haz clic o arrastra el Excel aquí')
  const [impResult, setImpResult] = useState(null)

  const cargar = useCallback(async () => {
    let url = '/personas/?tipo=docente&limit=500'
    if (busqueda) url += `&busqueda=${encodeURIComponent(busqueda)}`
    const d = await requestJSON(url)
    if (d) setDocentes(d)
  }, [requestJSON, busqueda])

  useEffect(() => { cargar() }, [cargar])

  async function guardarPersona() {
    if (!form.nombre.trim() || !form.email.trim())
      return toast('Nombre y correo son obligatorios', 'error')
    const d = await requestJSON('/personas/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo: 'docente', ...form }),
    })
    if (d) {
      toast('Docente agregado', 'success')
      setShowAdd(false)
      setForm({ nombre: '', email: '', cargo: '', departamento: '' })
      cargar()
    }
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este docente?')) return
    const d = await requestJSON(`/personas/${id}`, { method: 'DELETE' })
    if (d) { toast('Eliminado', 'success'); cargar() }
  }

  async function ejecutarImport() {
    if (!impFile) return
    const fd = new FormData()
    fd.append('archivo', impFile)
    const r = await request(`/personas/importar-excel?tipo=docente`, { method: 'POST', body: fd })
    const d = await r?.json()
    if (r?.ok) {
      setImpResult({ ok: true, msg: `✓ ${d.creados} docente(s) importados. ${d.omitidos} omitidos.` })
      cargar()
    } else {
      setImpResult({ ok: false, msg: d?.detail || 'Error al importar' })
    }
  }

  return (
    <div>
      <div className="panel">
        <div className="panel-title">Docentes e Investigadores</div>

        <div className="actions" style={{ marginTop: 0, marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
          <input
            type="text" placeholder="Buscar por nombre..." style={{ width: 220 }}
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          <div className="spacer" />
          <button className="btn btn-ghost btn-sm" onClick={() => { setImpResult(null); setShowImp(true) }}>
            📥 Importar Excel
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
            + Agregar docente
          </button>
        </div>

        {docentes.length === 0 ? (
          <p className="text-muted">Sin docentes registrados.</p>
        ) : (
          <table>
            <thead>
              <tr><th>Nombre</th><th>Cargo</th><th>Departamento</th><th>Correo</th><th></th></tr>
            </thead>
            <tbody>
              {docentes.map(d => (
                <tr key={d.id}>
                  <td><strong>{d.nombre}</strong></td>
                  <td style={{ color: '#666' }}>{d.cargo || '—'}</td>
                  <td style={{ color: '#888' }}>{d.departamento || '—'}</td>
                  <td style={{ color: '#667', fontSize: 12 }}>{d.email}</td>
                  <td>
                    <button
                      className="btn btn-sm"
                      style={{ background: '#fff0f0', color: 'var(--rojo)', border: 'none', cursor: 'pointer' }}
                      onClick={() => eliminar(d.id)}
                    >✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className="text-muted mt-8">{docentes.length} docente(s)</p>
      </div>

      {showAdd && (
        <Modal title="Agregar Docente" onClose={() => setShowAdd(false)}>
          <div className="form-grid">
            <div className="form-field full">
              <label>Nombre completo *</label>
              <input type="text" value={form.nombre}
                onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
            </div>
            <div className="form-field full">
              <label>Correo electrónico *</label>
              <input type="email" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="form-field">
              <label>Cargo</label>
              <input type="text" placeholder="Ej: Profesor de Tiempo Completo"
                value={form.cargo}
                onChange={e => setForm(f => ({ ...f, cargo: e.target.value }))} />
            </div>
            <div className="form-field">
              <label>Departamento</label>
              <input type="text" placeholder="Ej: Sistemas Computacionales"
                value={form.departamento}
                onChange={e => setForm(f => ({ ...f, departamento: e.target.value }))} />
            </div>
          </div>
          <div className="actions">
            <div className="spacer" />
            <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={guardarPersona}>Guardar</button>
          </div>
        </Modal>
      )}

      {showImp && (
        <Modal title="Importar Docentes desde Excel" onClose={() => setShowImp(false)}>
          <p className="text-muted" style={{ marginBottom: 12 }}>
            Columnas esperadas: <strong>nombre, email, cargo, departamento</strong>
          </p>
          <label className={`upload-zone${impFile ? ' drag' : ''}`} style={{ cursor: 'pointer' }}>
            <input type="file" accept=".xlsx,.xls" style={{ display: 'none' }}
              onChange={e => {
                const f = e.target.files[0]
                if (f) { setImpFile(f); setImpLabel(f.name) }
              }} />
            <div style={{ fontSize: 28, marginBottom: 8 }}>📊</div>
            <div style={{ fontSize: 13, color: '#667' }}>{impLabel}</div>
          </label>
          {impResult && (
            <div style={{
              marginTop: 12, padding: '10px 14px', borderRadius: 6,
              background: impResult.ok ? '#e8f5ee' : '#fff0f0',
              color: impResult.ok ? 'var(--verde)' : 'var(--rojo)', fontSize: 13,
            }}>{impResult.msg}</div>
          )}
          <div className="actions">
            <div className="spacer" />
            <button className="btn btn-ghost" onClick={() => setShowImp(false)}>Cerrar</button>
            <button className="btn btn-primary" disabled={!impFile} onClick={ejecutarImport}>Importar</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
