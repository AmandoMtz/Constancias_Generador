import { useAuth } from '../context/AuthContext'
import './Navbar.css'

export default function Navbar() {
  const { usuario, logout } = useAuth()

  return (
    <nav className="nav">
      <div className="nav-brand">
       <img src="/assets/logouat.png" alt="UAT" className="nav-brand-logo" />
        <div className="nav-sub">FI Tampico · UAT<br/>Generador de Constancias</div>
      </div>
      <div className="nav-spacer" />
      <div className="nav-user">
        <span>{usuario?.nombre}</span>
        <span className="nav-rol">{usuario?.rol}</span>
        <button className="nav-logout" onClick={logout}>Salir</button>
      </div>
    </nav>
  )
}
