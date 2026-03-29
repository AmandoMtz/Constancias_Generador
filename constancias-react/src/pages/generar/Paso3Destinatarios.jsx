import { useMemo, useState } from 'react'

function normalize(val) {
  return String(val || '').trim().toLowerCase().replace(/\s+/g, ' ')
}

function rowMatchesAlumno(row, alumno, nombreColumna) {
  const values = new Set([
    normalize(nombreColumna ? row?.[nombreColumna] : ''),
    normalize(row?.nombre),
    normalize(row?.email),
    normalize(row?.matricula),
  ].filter(Boolean))

  const alumnoValues = [
    normalize(alumno?.nombre),
    normalize(alumno?.email),
    normalize(alumno?.matricula),
  ].filter(Boolean)

  return alumnoValues.some(v => values.has(v))
}

export default function Paso3Destinatarios({
  excelFilename, sheetName, nombreColumna, excelColumns, previewRows, totalRows, marcadores,
  alumnos, selectedAlumnoIds, setSelectedAlumnoIds, onPrev, onNext,
}) {
  const [busquedaAlumno, setBusquedaAlumno] = useState('')

  const alumnosSeleccionados = useMemo(
    () => alumnos.filter(a => selectedAlumnoIds.includes(a.id)),
    [alumnos, selectedAlumnoIds],
  )

  const alumnosFiltrados = useMemo(() => {
    const q = normalize(busquedaAlumno)
    return alumnos.filter(a => {
      if (!q) return true
      return [a.nombre, a.email, a.matricula, a.programa].some(v => normalize(v).includes(q))
    })
  }, [alumnos, busquedaAlumno])

  const previewFiltrado = useMemo(() => {
    if (!selectedAlumnoIds.length) return previewRows
    return previewRows.filter(row =>
      alumnosSeleccionados.some(alumno => rowMatchesAlumno(row, alumno, nombreColumna))
    )
  }, [previewRows, alumnosSeleccionados, nombreColumna, selectedAlumnoIds.length])

  const totalEstimado = selectedAlumnoIds.length || totalRows

  function toggleAlumno(id) {
    setSelectedAlumnoIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  function limpiarSeleccion() {
    setSelectedAlumnoIds([])
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { n: totalRows, l: 'Registros del Excel' },
          { n: excelColumns.length, l: 'Columnas detectadas' },
          { n: marcadores.length, l: 'Marcadores configurados' },
          { n: totalEstimado, l: selectedAlumnoIds.length ? 'Alumnos seleccionados' : 'Constancias estimadas' },
        ].map(({ n, l }) => (
          <div key={l} style={{ background: 'var(--azul-claro)', borderRadius: 7, padding: '12px 16px', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 28, fontWeight: 700, color: 'var(--azul)' }}>{n}</div>
            <div style={{ fontSize: 11, color: '#667', marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="panel-title">Resumen del lote</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ background: '#fafafa', border: '1px solid var(--gris-bd)', borderRadius: 6, padding: 12 }}>
            <div style={{ fontSize: 11, color: '#667' }}>Archivo Excel</div>
            <div style={{ fontWeight: 700, color: 'var(--azul)', marginTop: 4 }}>{excelFilename || '—'}</div>
          </div>
          <div style={{ background: '#fafafa', border: '1px solid var(--gris-bd)', borderRadius: 6, padding: 12 }}>
            <div style={{ fontSize: 11, color: '#667' }}>Columna del nombre final</div>
            <div style={{ fontWeight: 700, color: 'var(--azul)', marginTop: 4 }}>{nombreColumna || '—'}</div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">Seleccionar alumnos del módulo Alumnos</div>
        <p className="text-muted" style={{ marginBottom: 12 }}>
          Esta selección es opcional. Si eliges alumnos aquí, solo se generarán constancias para esas personas. Si no eliges ninguno, se generarán para todos los registros del Excel.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '240px 160px 1fr', gap: 10, marginBottom: 12 }}>
          <input
            type="text"
            placeholder="Buscar alumno..."
            value={busquedaAlumno}
            onChange={e => setBusquedaAlumno(e.target.value)}
          />
          <button className="btn btn-ghost" onClick={limpiarSeleccion} disabled={!selectedAlumnoIds.length}>
            Limpiar selección
          </button>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', color: '#667', fontSize: 12 }}>
            {selectedAlumnoIds.length ? `${selectedAlumnoIds.length} alumno(s) seleccionados` : 'Sin filtro de alumnos'}
          </div>
        </div>

        <div style={{ maxHeight: 260, overflowY: 'auto', border: '1px solid var(--gris-bd)', borderRadius: 8 }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: 70 }}>Selección</th>
                <th>Nombre</th>
                <th>Programa</th>
                <th>Matrícula</th>
                <th>Correo</th>
              </tr>
            </thead>
            <tbody>
              {alumnosFiltrados.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 18, color: '#888' }}>No se encontraron alumnos.</td></tr>
              ) : alumnosFiltrados.map(alumno => {
                const checked = selectedAlumnoIds.includes(alumno.id)
                return (
                  <tr key={alumno.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleAlumno(alumno.id)}
                        style={{ width: 18, height: 18, accentColor: 'var(--azul)' }}
                      />
                    </td>
                    <td><strong>{alumno.nombre}</strong></td>
                    <td><span className="badge badge-blue">{alumno.programa || '—'}</span></td>
                    <td style={{ color: '#888' }}>{alumno.matricula || '—'}</td>
                    <td style={{ color: '#667', fontSize: 12 }}>{alumno.email || '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">Vista previa de registros</div>
        <p className="text-muted" style={{ marginBottom: 12 }}>
          {selectedAlumnoIds.length
            ? 'Vista previa de registros del Excel que coinciden con los alumnos seleccionados.'
            : 'Se generará una constancia por cada fila de la hoja seleccionada. Aquí ves una muestra de los primeros registros.'}
        </p>

        <div style={{ overflowX: 'auto', border: '1px solid var(--gris-bd)', borderRadius: 8 }}>
          <table>
            <thead>
              <tr>
                {excelColumns.map(col => <th key={col}>{col}</th>)}
              </tr>
            </thead>
            <tbody>
              {previewFiltrado.length === 0 ? (
                <tr><td colSpan={Math.max(1, excelColumns.length)} style={{ padding: 18, color: '#888' }}>No hay registros coincidentes para mostrar.</td></tr>
              ) : previewFiltrado.map((row, idx) => (
                <tr key={idx}>
                  {excelColumns.map(col => <td key={col}>{row[col] || '—'}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="actions">
        <button className="btn btn-ghost" onClick={onPrev}>← Anterior</button>
        <div className="spacer" />
        <button className="btn btn-primary" onClick={onNext} disabled={!totalRows}>Continuar →</button>
      </div>
    </div>
  )
}
