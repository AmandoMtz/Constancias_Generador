import { useState, useEffect, useCallback } from 'react'
import { useApi } from '../hooks/useApi'
import { useToast } from '../context/ToastContext'
import Modal from '../components/Modal'
import { PROGRAMAS } from '../constants'

export default function Alumnos() {
  const { request, requestJSON } = useApi()
  const toast = useToast()
  const [alumnos, setAlumnos]     = useState([])
  const [busqueda, setBusqueda]   = useState('')
  const [filtProg, setFiltProg]   = useState('')
  const [showAdd, setShowAdd]     = useState(false)
  const [showImp, setShowImp]     = useState(false)
  const [form, setForm] = useState({ nombre: '', email: '', programa: 'MCC', matricula: '' })
  const [impFile, setImpFile]     = useState(null)
  const [impLabel, setImpLabel]   = useState('Haz clic o arrastra el Excel aquí')
  const [impResult, setImpResult] = useState(null)

  const cargar = useCallback(async () => {
    let url = '/personas/?tipo=alumno&limit=500'
    if (busqueda) url += `&busqueda=${encodeURIComponent(busqueda)}`
    if (filtProg) url += `&programa=${filtProg}`
    const d = await requestJSON(url)
    if (d) setAlumnos(d)
  }, [requestJSON, busqueda, filtProg])

  useEffect(() => { cargar() }, [cargar])

  async function guardarPersona() {
    if (!form.nombre.trim() || !form.email.trim())
      return toast('Nombre y correo son obligatorios', 'error')
    const d = await requestJSON('/personas/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo: 'alumno', ...form }),
    })
    if (d) {
      toast('Alumno agregado', 'success')
      setShowAdd(false)
      setForm({ nombre: '', email: '', programa: 'MCC', matricula: '' })
      cargar()
    }
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este alumno?')) return
    const d = await requestJSON(`/personas/${id}`, { method: 'DELETE' })
    if (d) { toast('Eliminado', 'success'); cargar() }
  }

  async function ejecutarImport() {
    if (!impFile) return
    const fd = new FormData()
    fd.append('archivo', impFile)
    const r = await request(`/personas/importar-excel?tipo=alumno`, { method: 'POST', body: fd })
    const d = await r?.json()
    if (r?.ok) {
      setImpResult({ ok: true, msg: `✓ ${d.creados} alumno(s) importados. ${d.omitidos} omitidos.` })
      cargar()
    } else {
      setImpResult({ ok: false, msg: d?.detail || 'Error al importar' })
    }
  }

  return (
    <div>
      <div className="panel">
        <div className="panel-title">Alumnos de Posgrado</div>

        <div className="actions" style={{ marginTop: 0, marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
          <input
            type="text" placeholder="Buscar por nombre..." style={{ width: 220 }}
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          <select style={{ width: 160 }} value={filtProg} onChange={e => setFiltProg(e.target.value)}>
            <option value="">Todos los programas</option>
            {PROGRAMAS.map(p => <option key={p.code} value={p.code}>{p.code}</option>)}
          </select>
          <div className="spacer" />
          <button className="btn btn-ghost btn-sm" onClick={() => { setImpResult(null); setShowImp(true) }}>
            📥 Importar Excel
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
            + Agregar alumno
          </button>
        </div>

        {alumnos.length === 0 ? (
          <p className="text-muted">Sin alumnos registrados.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nombre</th><th>Programa</th><th>Matrícula</th><th>Correo</th><th></th>
              </tr>
            </thead>
            <tbody>
              {alumnos.map(a => (
                <tr key={a.id}>
                  <td><strong>{a.nombre}</strong></td>
                  <td><span className="badge badge-blue">{a.programa}</span></td>
                  <td style={{ color: '#888' }}>{a.matricula || '—'}</td>
                  <td style={{ color: '#667', fontSize: 12 }}>{a.email}</td>
                  <td>
                    <button
                      className="btn btn-sm"
                      style={{ background: '#fff0f0', color: 'var(--rojo)', border: 'none', cursor: 'pointer' }}
                      onClick={() => eliminar(a.id)}
                    >✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className="text-muted mt-8">{alumnos.length} alumno(s)</p>
      </div>

      {/* Modal agregar */}
      {showAdd && (
        <Modal title="Agregar Alumno" onClose={() => setShowAdd(false)}>
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
              <label>Programa</label>
              <select value={form.programa}
                onChange={e => setForm(f => ({ ...f, programa: e.target.value }))}>
                {PROGRAMAS.map(p => <option key={p.code} value={p.code}>{p.code} — {p.name}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Matrícula</label>
              <input type="text" value={form.matricula}
                onChange={e => setForm(f => ({ ...f, matricula: e.target.value }))} />
            </div>
          </div>
          <div className="actions">
            <div className="spacer" />
            <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={guardarPersona}>Guardar</button>
          </div>
        </Modal>
      )}

      {/* Modal importar */}
      {showImp && (
        <Modal title="Importar Alumnos desde Excel" onClose={() => setShowImp(false)}>
          <p className="text-muted" style={{ marginBottom: 12 }}>
            El archivo Excel debe tener columnas: <strong>nombre, email, programa, matricula</strong>
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
              color: impResult.ok ? 'var(--verde)' : 'var(--rojo)',
              fontSize: 13,
            }}>{impResult.msg}</div>
          )}
          <div className="actions">
            <div className="spacer" />
            <button className="btn btn-ghost" onClick={() => setShowImp(false)}>Cerrar</button>
            <button className="btn btn-primary" disabled={!impFile} onClick={ejecutarImport}>
              Importar
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
