import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import Login      from './pages/Login'
import Navbar     from './components/Navbar'
import Sidebar    from './components/Sidebar'
import Generar    from './pages/generar/Generar'
import Plantillas from './pages/Plantillas'
import Alumnos    from './pages/Alumnos'
import Docentes   from './pages/Docentes'
import Historial  from './pages/Historial'
import Usuarios   from './pages/Usuarios'

function AppLayout() {
  const { isLoggedIn, usuario } = useAuth()
  const [page, setPage]                 = useState('generar')
  const [initPlantilla, setInitPlantilla] = useState(null)

  if (!isLoggedIn) return <Login />

  function handleUsarPlantilla(id) {
    setInitPlantilla(id)
    setPage('generar')
  }

  function navigate(p) {
    setPage(p)
    if (p !== 'generar') setInitPlantilla(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar activePage={page} onNavigate={navigate} />
        <main style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
          {page === 'generar'    && <Generar key={initPlantilla} initialPlantillaId={initPlantilla} />}
          {page === 'plantillas' && <Plantillas onUsarPlantilla={handleUsarPlantilla} />}
          {page === 'alumnos'    && <Alumnos />}
          {page === 'docentes'   && <Docentes />}
          {page === 'historial'  && <Historial />}
          {page === 'usuarios'   && usuario?.rol === 'admin' && <Usuarios />}
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppLayout />
      </ToastProvider>
    </AuthProvider>
  )
}
