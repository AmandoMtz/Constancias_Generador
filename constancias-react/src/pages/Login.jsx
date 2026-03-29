import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import './Login.css'

function EyeIcon({ open }) {
  return open ? (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 4l16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  async function doLogin() {
    setError('')
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('username', email)
      fd.append('password', pass)
      const r = await fetch('https://constanciasgenerador-production.up.railway.app/api/auth/login', { method: 'POST', body: fd })
      const d = await r.json()
      if (!r.ok) throw new Error(d.detail || 'Error al iniciar sesión')
      login(d.access_token, d.usuario)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-screen">
      <div className="login-topbar">
        <img src="/assets/uat-horizontal.png" alt="UAT" className="login-top-logo login-top-logo-left" />
        <img src="/assets/logo-70-blanco.png" alt="70 Aniversario FIT" className="login-top-logo login-top-logo-right" />
      </div>

      <div className="login-layout">
        <section className="login-hero">
          <div className="login-hero-overlay" />
          <img src="/assets/login-bg.jpg" alt="FI Tampico" className="login-hero-image" />
          <div className="login-hero-copy">
            <div className="login-hero-badge">FI Tampico · UAT</div>
            <h1>Generador de constancias</h1>
            <p>
              Plataforma institucional para la administración, personalización y generación de constancias.
            </p>
          </div>
        </section>

        <section className="login-panel-wrap">
          <div className="login-card">
            <div className="login-logo-block">
              <img src="/assets/uat-horizontal-negro.png" alt="Universidad Autónoma de Tamaulipas" className="login-main-logo" />
              <div className="login-inst-name">FI Tampico · UAT</div>
              <div className="login-inst-sub">División de Estudios de Posgrado e Investigación</div>
            </div>

            <div className="login-title">Iniciar sesión</div>
            <div className="login-subtitle">Accede para administrar plantillas, destinatarios y generación de constancias.</div>

            <div className="login-field">
              <label>Correo institucional</label>
              <input
                type="email"
                value={email}
                placeholder="usuario@uat.edu.mx"
                autoComplete="username"
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && document.getElementById('login-pass-input').focus()}
              />
            </div>

            <div className="login-field">
              <label>Contraseña</label>
              <div className="password-wrap">
                <input
                  id="login-pass-input"
                  type={showPass ? 'text' : 'password'}
                  value={pass}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  onChange={e => setPass(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && doLogin()}
                />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  onClick={() => setShowPass(v => !v)}
                >
                  <EyeIcon open={showPass} />
                </button>
              </div>
            </div>

            <button className="login-btn" onClick={doLogin} disabled={loading}>
              {loading ? 'Iniciando...' : 'Iniciar sesión'}
            </button>

            {error && <div className="login-err">{error}</div>}

            <div className="login-footer">Universidad Autónoma de Tamaulipas · 2026</div>
          </div>
        </section>
      </div>
    </div>
  )
}
