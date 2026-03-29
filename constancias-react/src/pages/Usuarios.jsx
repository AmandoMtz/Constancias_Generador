import { useState, useEffect, useCallback } from 'react'
import { useApi } from '../hooks/useApi'
import { useToast } from '../context/ToastContext'
import Modal from '../components/Modal'

const ROL_BADGE = { admin: 'badge-red', director: 'badge-blue', secretaria: 'badge-green' }

export default function Usuarios() {
  const { requestJSON } = useApi()
  const toast = useToast()
  const [usuarios, setUsuarios] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ nombre: '', email: '', password: '', rol: 'secretaria' })

  const cargar = useCallback(async () => {
    const d = await requestJSON('/usuarios/')
    if (d) setUsuarios(d)
  }, [requestJSON])

  useEffect(() => { cargar() }, [cargar])

  async function crearUsuario() {
    if (!form.nombre || !form.email || !form.password)
      return toast('Completa todos los campos', 'error')
    const d = await requestJSON('/usuarios/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (d) {
      toast('Usuario creado correctamente', 'success')
      setShowModal(false)
      setForm({ nombre: '', email: '', password: '', rol: 'secretaria' })
      cargar()
    }
  }

  async function toggleUsuario(id, activar) {
    const d = await requestJSON(`/usuarios/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activo: activar }),
    })
    if (d) { toast(activar ? 'Usuario activado' : 'Usuario desactivado'); cargar() }
  }

  return (
    <div className="panel">
      <div className="panel-title">Gestión de Usuarios</div>
      <div className="actions" style={{ marginTop: 0, marginBottom: 14 }}>
        <div className="spacer" />
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
          + Nuevo usuario
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Nombre</th><th>Correo</th><th>Rol</th>
            <th>Estado</th><th>Último acceso</th><th></th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map(u => (
            <tr key={u.id}>
              <td><strong>{u.nombre}</strong></td>
              <td style={{ color: '#667', fontSize: 12 }}>{u.email}</td>
              <td><span className={`badge ${ROL_BADGE[u.rol] || 'badge-blue'}`}>{u.rol}</span></td>
              <td>
                <span className={`badge ${u.activo ? 'badge-green' : 'badge-red'}`}>
                  {u.activo ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td style={{ fontSize: 12, color: '#888' }}>
                {u.last_login?.substring(0, 16).replace('T', ' ') || 'Nunca'}
              </td>
              <td>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => toggleUsuario(u.id, !u.activo)}
                >
                  {u.activo ? 'Desactivar' : 'Activar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <Modal title="Nuevo Usuario" onClose={() => setShowModal(false)}>
          <div className="form-grid">
            <div className="form-field full">
              <label>Nombre completo *</label>
              <input type="text" value={form.nombre}
                onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
            </div>
            <div className="form-field full">
              <label>Correo institucional *</label>
              <input type="email" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="form-field">
              <label>Contraseña *</label>
              <input type="password" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            <div className="form-field">
              <label>Rol</label>
              <select value={form.rol}
                onChange={e => setForm(f => ({ ...f, rol: e.target.value }))}>
                <option value="secretaria">Secretaria</option>
                <option value="director">Director</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>
          <div className="actions">
            <div className="spacer" />
            <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={crearUsuario}>Crear usuario</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
