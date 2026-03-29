import { useState } from 'react'
import { useApi } from '../../hooks/useApi'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import PreviewCard from '../../components/PreviewCard'
import Modal from '../../components/Modal'

export default function Paso4Envio({
  plantillaSelId,
  marcadores,
  evento,
  fecha,
  totalRows,
  excelSource,
  excelFilename,
  sheetName,
  alumnos,
  selectedAlumnoIds,
  onPrev,
  onReset,
}) {
  const { requestJSON, API } = useApi()
  const { token } = useAuth()
  const toast = useToast()

  const [metodo, setMetodo] = useState('zip')
  const [generando, setGenerando] = useState(false)
  const [progreso, setProgreso] = useState(null)
  const [envioId, setEnvioId] = useState(null)
  const [zipListo, setZipListo] = useState(false)
  const [previews, setPreviews] = useState([])
  const [previewActiva, setPreviewActiva] = useState(null)
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null)

  async function ejecutar() {
    if (!marcadores.length) {
      return toast('Configura al menos un marcador', 'error')
    }

    if (!excelSource?.excel_id || !excelSource?.sheet_name) {
      return toast('Falta la configuración del Excel', 'error')
    }

    setGenerando(true)
    setPreviews([])
    setPreviewActiva(null)
    setZipListo(false)
    setProgreso({
      total: totalRows || 0,
      enviados: 0,
      errores: 0,
      estado: 'procesando',
    })

    try {
      await requestJSON(`/plantillas/${plantillaSelId}/marcadores`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          marcadores,
          evento,
          fecha_evento: fecha,
        }),
      })

      const body = {
        plantilla_id: plantillaSelId,
        persona_ids: selectedAlumnoIds,
        excel_source: excelSource,
        como_pdf: true,
        metodo_envio: metodo,
        datos_extra: { evento, fecha },
      }

      const d = await requestJSON('/constancias/generar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!d) {
        setGenerando(false)
        setProgreso(null)
        return
      }

      setEnvioId(d.envio_id)
      toast(`Generando ${d.total} constancia(s)...`)

      const interval = setInterval(async () => {
        try {
          const est = await requestJSON(`/constancias/estado/${d.envio_id}`)
          if (!est) return

          setProgreso({ ...est })

          if (est.estado === 'completado' || est.estado === 'error') {
            clearInterval(interval)
            setGenerando(false)

            if (est.estado === 'completado') {
              toast(`¡Listo! ${est.enviados} constancias generadas.`, 'success')
              if (metodo === 'zip' && est.zip_listo) {
                setZipListo(true)
              }
            } else {
              toast(`Completado con ${est.errores} error(es).`, 'error')
            }

            await cargarPreviews(d.envio_id)
          }
        } catch (error) {
          clearInterval(interval)
          setGenerando(false)
          console.error('Error consultando estado:', error)
          toast('Ocurrió un error consultando el estado del lote.', 'error')
        }
      }, 1800)
    } catch (error) {
      console.error('Error al generar constancias:', error)
      setGenerando(false)
      setProgreso(null)
      toast('Ocurrió un error al generar las constancias.', 'error')
    }
  }

  async function cargarPreviews(eid) {
    try {
      const data = await requestJSON(`/constancias/lote/${eid}/previews`)
      if (Array.isArray(data) && data.length > 0) {
        setPreviews(data)
      } else {
        setPreviews([])
      }
    } catch (error) {
      console.error('Error cargando previews:', error)
      setPreviews([])
    }
  }

  function thumbUrl(urlPreview) {
    if (!urlPreview) return '#'
    if (urlPreview.startsWith('http://') || urlPreview.startsWith('https://')) {
      return urlPreview
    }
    return `${API}${urlPreview}?token=${token}`
  }

  function archivoUrl(urlArchivo) {
    if (!urlArchivo) return '#'
    if (urlArchivo.startsWith('http://') || urlArchivo.startsWith('https://')) {
      return urlArchivo
    }
    return `${API}${urlArchivo}?token=${token}`
  }

  async function abrirPreview(p) {
    setPreviewActiva(p)
    setPdfBlobUrl(null)
    try {
      const res = await fetch(archivoUrl(p.url_archivo))
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setPdfBlobUrl(url)
    } catch (e) {
      console.error('Error cargando PDF como blob:', e)
    }
  }

  function cerrarPreview() {
    setPreviewActiva(null)
    if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl)
    setPdfBlobUrl(null)
  }

  const alumnosSeleccionados = alumnos.filter(a => selectedAlumnoIds.includes(a.id))

  const pct = progreso?.total
    ? Math.round((progreso.enviados / progreso.total) * 100)
    : 0

  const zipUrl = envioId
    ? `${API}/constancias/lote/${envioId}/zip?token=${token}`
    : '#'

  const terminado =
    progreso?.estado === 'completado' || progreso?.estado === 'error'

  return (
    <div>
      <div className="panel">
        <div className="panel-title">Resumen final</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {[
            { l: selectedAlumnoIds.length ? 'Alumnos seleccionados' : 'Registros a generar', v: selectedAlumnoIds.length || totalRows },
            { l: 'Marcadores configurados', v: marcadores.length },
            { l: 'Excel', v: excelFilename || '—' },
            { l: 'Filtro de alumnos', v: selectedAlumnoIds.length ? `${selectedAlumnoIds.length} seleccionados` : 'Todos los registros' },
            { l: 'Hoja', v: sheetName || '—' },
            { l: 'Evento', v: evento || '—' },
            { l: 'Fecha', v: fecha || '—' },
          ].map(({ l, v }) => (
            <div
              key={l}
              style={{
                background: 'var(--azul-claro)',
                borderRadius: 6,
                padding: '10px 14px',
              }}
            >
              <div style={{ fontSize: 11, color: '#667' }}>{l}</div>
              <div style={{ fontWeight: 700, color: 'var(--azul)', marginTop: 2 }}>
                {v}
              </div>
            </div>
          ))}
        </div>

        {selectedAlumnoIds.length > 0 && (
          <div style={{ marginTop: 12, padding: 12, background: '#fafafa', border: '1px solid var(--gris-bd)', borderRadius: 6 }}>
            <div style={{ fontSize: 11, color: '#667', marginBottom: 6 }}>Alumnos elegidos</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {alumnosSeleccionados.map(alumno => (
                <span key={alumno.id} className="badge badge-blue">
                  {alumno.nombre}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="panel">
        <div className="panel-title">Método de salida</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
          <div
            style={{
              border: '1.5px solid var(--azul)',
              borderRadius: 8,
              padding: 16,
              background: 'var(--azul-claro)',
            }}
          >
            <div style={{ fontWeight: 700, color: 'var(--azul)', marginBottom: 6 }}>
              📦 Descargar ZIP
            </div>
            <div style={{ fontSize: 12, color: '#666', lineHeight: 1.4 }}>
              Se generará una constancia por cada fila de la hoja seleccionada y se
              empaquetarán todas en un ZIP descargable.
            </div>
          </div>
        </div>
      </div>

      {progreso && (
        <div className="panel">
          <div style={{ fontWeight: 600, color: 'var(--azul)', marginBottom: 8 }}>
            {progreso.estado === 'completado'
              ? '✅ Generación completada'
              : progreso.estado === 'error'
              ? '⚠️ Completado con errores'
              : '⏳ Generando constancias...'}
          </div>

          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>

          <div style={{ fontSize: 12, color: '#667', marginTop: 4 }}>
            {progreso.enviados} / {progreso.total} constancias
            {progreso.errores > 0 && ` · ${progreso.errores} error(es)`}
          </div>

          {zipListo && envioId && (
            <a
              href={zipUrl}
              className="btn btn-success"
              style={{
                marginTop: 12,
                textDecoration: 'none',
                display: 'inline-flex',
              }}
            >
              ⬇ Descargar ZIP
            </a>
          )}
        </div>
      )}

      {previews.length > 0 && (
        <div className="panel">
          <div className="panel-title">Previsualización ({previews.length})</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, paddingTop: 4 }}>
            {previews.map((p, i) => (
              <PreviewCard
                key={i}
                src={thumbUrl(p.url_preview)}
                nombre={p.nombre_archivo}
                onClick={() => abrirPreview(p)}
              />
            ))}
          </div>
        </div>
      )}

      {previewActiva && (
        <Modal title={previewActiva.nombre_archivo} onClose={cerrarPreview}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <a
                href={archivoUrl(previewActiva.url_archivo)}
                download={previewActiva.nombre_archivo}
                className="btn btn-success"
                style={{ textDecoration: 'none', fontSize: 13, padding: '6px 14px' }}
              >
                ⬇ Descargar PDF
              </a>
            </div>

            {pdfBlobUrl ? (
              <embed
                src={pdfBlobUrl}
                type="application/pdf"
                style={{ width: '100%', height: '80vh', border: 'none', borderRadius: '10px' }}
              />
            ) : (
              <div style={{
                height: '80vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#999',
                fontSize: 14,
              }}>
                ⏳ Cargando PDF...
              </div>
            )}

            <p style={{ fontSize: 12, color: '#999', textAlign: 'center', margin: 0 }}>
              ¿No se muestra?{' '}
              <a
                href={archivoUrl(previewActiva.url_archivo)}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--rojo)' }}
              >
                Ábrelo en nueva pestaña
              </a>
            </p>
          </div>
        </Modal>
      )}

      <div className="actions">
        <button className="btn btn-ghost" onClick={onPrev} disabled={generando}>
          ← Anterior
        </button>

        <div className="spacer" />

        {terminado ? (
          <button className="btn btn-ghost" onClick={onReset}>
            Nuevo lote
          </button>
        ) : (
          <button
            className="btn btn-gold"
            onClick={ejecutar}
            disabled={generando || !metodo}
          >
            {generando ? 'Generando...' : '🚀 GENERAR CONSTANCIAS'}
          </button>
        )}
      </div>
    </div>
  )
}
