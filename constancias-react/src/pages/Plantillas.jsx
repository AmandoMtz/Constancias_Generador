import { useState, useEffect, useCallback } from 'react'
import { useApi } from '../hooks/useApi'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import Modal from '../components/Modal'

export default function Plantillas({ onUsarPlantilla }) {
  const { request, requestJSON, API } = useApi()
  const { token } = useAuth()
  const toast = useToast()
  const [plantillas, setPlantillas] = useState([])
  const [showModal, setShowModal]   = useState(false)
  const [uploading, setUploading]   = useState(false)
  const [form, setForm] = useState({ nombre: '', evento: '', fecha_evento: '', archivo: null })
  const [fileName, setFileName] = useState('Haz clic o arrastra el archivo aquí')
  const [preview, setPreview]   = useState(null)   // { plantilla, downloadUrl }

  const cargar = useCallback(async () => {
    const d = await requestJSON('/plantillas/')
    if (d) setPlantillas(d)
  }, [requestJSON])

  useEffect(() => { cargar() }, [cargar])

  async function subirPlantilla() {
    if (!form.nombre.trim()) return toast('Escribe un nombre para la plantilla', 'error')
    if (!form.archivo)       return toast('Selecciona un archivo', 'error')
    setUploading(true)
    const fd = new FormData()
    fd.append('archivo', form.archivo)
    fd.append('nombre', form.nombre)
    fd.append('evento', form.evento)
    fd.append('fecha_evento', form.fecha_evento)
    const r = await request('/plantillas/', { method: 'POST', body: fd })
    const d = await r?.json()
    setUploading(false)
    if (r?.ok) {
      toast('Plantilla subida correctamente', 'success')
      setShowModal(false)
      setForm({ nombre: '', evento: '', fecha_evento: '', archivo: null })
      setFileName('Haz clic o arrastra el archivo aquí')
      cargar()
    } else {
      toast(d?.detail || 'Error al subir', 'error')
    }
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar esta plantilla?')) return
    const d = await requestJSON(`/plantillas/${id}`, { method: 'DELETE' })
    if (d) { toast('Plantilla eliminada', 'success'); cargar() }
  }

  function verPreview(p) {
    const downloadUrl = `${API}/plantillas/${p.id}/descargar?token=${token}`
    setPreview({ plantilla: p, downloadUrl })
  }

  return (
    <div>
      <div className="panel">
        <div className="panel-title">Plantillas de Constancias</div>
        <div className="actions" style={{ marginTop: 0, marginBottom: 16 }}>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Nueva plantilla
          </button>
        </div>

        {plantillas.length === 0 ? (
          <p className="text-muted">Sin plantillas registradas. Sube una para comenzar.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Formato</th>
                <th>Evento</th>
                <th>Marcadores</th>
                <th>Fecha</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {plantillas.map(p => (
                <tr key={p.id}>
                  <td><strong>{p.nombre}</strong></td>
                  <td><span className="badge badge-blue">{p.formato.toUpperCase()}</span></td>
                  <td style={{ color: '#666' }}>{p.evento || '—'}</td>
                  <td>{p.marcadores?.length || 0} configurados</td>
                  <td style={{ color: '#888', fontSize: 12 }}>{p.created_at?.substring(0, 10) || '—'}</td>
                  <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => verPreview(p)}
                      title="Previsualizar"
                    >👁 Ver</button>
                    <a
                      href={`${API}/plantillas/${p.id}/descargar?token=${token}`}
                      className="btn btn-ghost btn-sm"
                      style={{ textDecoration: 'none' }}
                      title="Descargar archivo original"
                    >⬇ Descargar</a>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => onUsarPlantilla?.(p.id)}
                    >Usar</button>
                    <button
                      className="btn btn-sm"
                      style={{ background: '#fff0f0', color: 'var(--rojo)', border: 'none', cursor: 'pointer' }}
                      onClick={() => eliminar(p.id)}
                    >✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Modal nueva plantilla ── */}
      {showModal && (
        <Modal title="Nueva Plantilla" onClose={() => setShowModal(false)}>
          <div className="form-grid">
            <div className="form-field full">
              <label>Nombre de la plantilla *</label>
              <input
                type="text" placeholder="Ej: Constancia de Participación CIINDET 2026"
                value={form.nombre}
                onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
              />
            </div>
            <div className="form-field">
              <label>Evento</label>
              <input
                type="text" placeholder="Ej: CIINDET 2026"
                value={form.evento}
                onChange={e => setForm(f => ({ ...f, evento: e.target.value }))}
              />
            </div>
            <div className="form-field">
              <label>Fecha del evento</label>
              <input
                type="text" placeholder="Ej: 15-17 de octubre de 2026"
                value={form.fecha_evento}
                onChange={e => setForm(f => ({ ...f, fecha_evento: e.target.value }))}
              />
            </div>
            <div className="form-field full">
              <label>Archivo (PPTX, DOCX o PDF) *</label>
              <label
                className={`upload-zone${form.archivo ? ' drag' : ''}`}
                style={{ cursor: 'pointer' }}
              >
                <input
                  type="file" accept=".pptx,.docx,.pdf"
                  style={{ display: 'none' }}
                  onChange={e => {
                    const f = e.target.files[0]
                    if (f) { setForm(fr => ({ ...fr, archivo: f })); setFileName(f.name) }
                  }}
                />
                <div style={{ fontSize: 28, marginBottom: 8 }}>📁</div>
                <div style={{ fontSize: 13, color: '#667' }}>{fileName}</div>
                <div className="text-muted mt-8">PPTX · DOCX · PDF</div>
              </label>
            </div>
          </div>
          <div className="actions">
            <div className="spacer" />
            <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={subirPlantilla} disabled={uploading}>
              {uploading ? 'Subiendo...' : 'Subir plantilla'}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Modal preview con Office Online Viewer ── */}
      {preview && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.55)',
            zIndex: 500,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={e => { if (e.target === e.currentTarget) setPreview(null) }}
        >
          <div style={{
            background: '#fff',
            borderRadius: 12,
            width: '90vw',
            maxWidth: 960,
            height: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
          }}>
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 24px',
              borderBottom: '1px solid var(--gris-bd)',
              flexShrink: 0,
            }}>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 20, fontWeight: 700, color: 'var(--azul)',
              }}>
                Vista previa — {preview.plantilla.nombre}
              </div>
              <button
                onClick={() => setPreview(null)}
                style={{
                  background: 'none', border: 'none', fontSize: 22,
                  cursor: 'pointer', color: '#888', lineHeight: 1,
                  padding: '0 4px',
                }}
              >×</button>
            </div>

            {/* Viewer */}
            <div style={{ flex: 1, overflow: 'hidden', background: '#f0f0f0' }}>
              <OfficeViewer
                downloadUrl={preview.downloadUrl}
                formato={preview.plantilla.formato}
                nombre={preview.plantilla.nombre}
              />
            </div>

            {/* Footer */}
            <div style={{
              display: 'flex', justifyContent: 'flex-end', gap: 10,
              padding: '14px 24px',
              borderTop: '1px solid var(--gris-bd)',
              flexShrink: 0,
            }}>
              <a
                href={preview.downloadUrl}
                className="btn btn-ghost"
                style={{ textDecoration: 'none' }}
              >
                ⬇ Descargar original
              </a>
              <button
                className="btn btn-primary"
                onClick={() => { onUsarPlantilla?.(preview.plantilla.id); setPreview(null) }}
              >
                Usar esta plantilla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   OfficeViewer
   Intenta renderizar el archivo con Microsoft Office Online Viewer.
   Como el archivo está en localhost (no accesible desde internet), usa
   un objeto URL blob descargando el archivo primero y mostrándolo en iframe
   nativo del navegador (funciona bien para PDF; para PPTX/DOCX muestra
   la descarga de Office o usa el viewer embebido de Google Docs).
───────────────────────────────────────────────────────────────────────────── */
function OfficeViewer({ downloadUrl, formato, nombre }) {
  const [blobUrl, setBlobUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)

  useEffect(() => {
    let url = null
    setLoading(true)
    setError(false)
    setBlobUrl(null)

    fetch(downloadUrl)
      .then(r => {
        if (!r.ok) throw new Error('Error descargando archivo')
        return r.blob()
      })
      .then(blob => {
        url = URL.createObjectURL(blob)
        setBlobUrl(url)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })

    return () => { if (url) URL.revokeObjectURL(url) }
  }, [downloadUrl])

  if (loading) {
    return (
      <div style={{
        height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 12, color: '#888',
      }}>
        <div style={{
          width: 36, height: 36, border: '3px solid #ddd',
          borderTopColor: 'var(--azul)', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <span style={{ fontSize: 13 }}>Cargando vista previa...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (error || !blobUrl) {
    return <FallbackViewer downloadUrl={downloadUrl} nombre={nombre} formato={formato} />
  }

  // PDF: iframe nativo del navegador (render perfecto)
  if (formato === 'pdf') {
    return (
      <iframe
        src={blobUrl}
        style={{ width: '100%', height: '100%', border: 'none' }}
        title={nombre}
      />
    )
  }

  // PPTX / DOCX: Office Online Viewer con URL pública no es posible en localhost,
  // entonces mostramos el archivo en un viewer enriquecido con opción de abrir en Office.
  return <RichOfficeViewer blobUrl={blobUrl} downloadUrl={downloadUrl} formato={formato} nombre={nombre} />
}

/* Vista enriquecida para PPTX/DOCX cuando no hay LibreOffice */
function RichOfficeViewer({ blobUrl, downloadUrl, formato, nombre }) {
  const icon  = formato === 'pptx' ? '📊' : '📝'
  const label = formato === 'pptx' ? 'PowerPoint' : 'Word'
  const color = formato === 'pptx' ? '#C55A11' : '#1F5C9E'

  return (
    <div style={{
      height: '100%',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 20, padding: 40, textAlign: 'center',
      background: '#fafafa',
    }}>
      <div style={{ fontSize: 64 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 18, fontWeight: 700, color, marginBottom: 6 }}>
          Archivo {label}
        </div>
        <div style={{ fontSize: 13, color: '#666', maxWidth: 380, lineHeight: 1.5 }}>
          Para ver el diseño completo con colores e imágenes, ábrelo directamente
          en PowerPoint o instala{' '}
          <a href="https://www.libreoffice.org/download/libreoffice/"
            target="_blank" rel="noreferrer"
            style={{ color: 'var(--azul)', fontWeight: 600 }}>
            LibreOffice
          </a>{' '}
          en el servidor para habilitar la vista previa automática.
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Abrir en Office Online (requiere que el archivo esté en internet) */}
        <a
          href={downloadUrl}
          download={`${nombre}.${formato}`}
          className="btn btn-primary"
          style={{ textDecoration: 'none' }}
        >
          ⬇ Descargar y abrir
        </a>
        <a
          href={`ms-powerpoint:ofe|u|${downloadUrl}`}
          className="btn btn-ghost"
          style={{ textDecoration: 'none' }}
          title="Abrir directamente en PowerPoint (si está instalado)"
        >
          📊 Abrir en PowerPoint
        </a>
      </div>

      <div style={{
        marginTop: 8, padding: '10px 18px',
        background: '#fff3cd', borderRadius: 8,
        fontSize: 12, color: '#856000', maxWidth: 420,
      }}>
        💡 <strong>Tip:</strong> Instala LibreOffice en el servidor y reinicia para
        ver el diseño completo directamente aquí.
      </div>
    </div>
  )
}

/* Fallback si falla la descarga del blob */
function FallbackViewer({ downloadUrl, nombre, formato }) {
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 16, color: '#888', padding: 32, textAlign: 'center',
    }}>
      <div style={{ fontSize: 48 }}>⚠️</div>
      <div style={{ fontSize: 14, color: '#666' }}>
        No se pudo cargar la vista previa.
      </div>
      <a href={downloadUrl} download={`${nombre}.${formato}`}
        className="btn btn-ghost" style={{ textDecoration: 'none' }}>
        ⬇ Descargar archivo
      </a>
    </div>
  )
}
