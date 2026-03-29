import { useAuth } from '../context/AuthContext'
import './Sidebar.css'

const navItems = [
  { id: 'generar',    label: 'Generar Constancias', section: 'principal', icon: '📄' },
  { id: 'plantillas', label: 'Plantillas',           section: 'principal', icon: '🗂️' },
  { id: 'alumnos',    label: 'Alumnos',              section: 'personas',  icon: '🎓' },
  { id: 'docentes',   label: 'Docentes',             section: 'personas',  icon: '👨‍🏫' },
  { id: 'historial',  label: 'Historial',            section: 'reportes',  icon: '📋' },
]

const adminItems = [
  { id: 'usuarios', label: 'Usuarios', section: 'admin', icon: '👤' },
]

export default function Sidebar({ activePage, onNavigate }) {
  const { usuario } = useAuth()

  const renderItem = (item) => (
    <div
      key={item.id}
      className={`sb-item${activePage === item.id ? ' active' : ''}`}
      onClick={() => onNavigate(item.id)}
    >
      <span className="sb-icon">{item.icon}</span>
      {item.label}
    </div>
  )

  return (
    <aside className="sidebar">
      <div className="sb-section">Principal</div>
      {navItems.filter(i => i.section === 'principal').map(renderItem)}

      <div className="sb-section" style={{ marginTop: 12 }}>Personas</div>
      {navItems.filter(i => i.section === 'personas').map(renderItem)}

      <div className="sb-section" style={{ marginTop: 12 }}>Reportes</div>
      {navItems.filter(i => i.section === 'reportes').map(renderItem)}

      {usuario?.rol === 'admin' && (
        <>
          <div className="sb-section" style={{ marginTop: 12 }}>Administración</div>
          {adminItems.map(renderItem)}
        </>
      )}
    </aside>
  )
}
