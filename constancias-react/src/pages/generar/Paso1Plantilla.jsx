import { useRef } from 'react'

export default function Paso1Plantilla({
  plantillas, plantillaSelId, onSelPlantilla,
  excelFilename, excelSheets, sheetName,
  onUploadExcel, onSelectSheet,
  nombreColumna, setNombreColumna, excelColumns, totalRows,
  onNext,
}) {
  const fileRef = useRef(null)

  return (
    <div>
      <div className="panel">
        <div className="panel-title">Selecciona una plantilla</div>
        {plantillas.length === 0 ? (
          <p className="text-muted">No hay plantillas. Ve a la sección Plantillas y sube una.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {plantillas.map(p => (
              <div
                key={p.id}
                style={{
                  border: `1.5px solid ${plantillaSelId === p.id ? 'var(--azul)' : 'var(--gris-bd)'}`,
                  borderRadius: 7, padding: '12px 16px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: plantillaSelId === p.id ? 'var(--azul-claro)' : '#fff',
                  transition: '.15s',
                }}
                onClick={() => onSelPlantilla(p.id)}
              >
                <div style={{
                  width: 36, height: 36, background: 'var(--azul-claro)',
                  borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700, color: 'var(--azul)',
                }}>
                  {p.formato.toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: 'var(--azul)' }}>{p.nombre}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>
                    {p.evento || 'Sin evento'} · {p.marcadores?.length || 0} marcadores configurados
                  </div>
                </div>
                {plantillaSelId === p.id && (
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--verde)' }}>✓ Seleccionada</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="panel">
        <div className="panel-title">Archivo Excel con datos</div>
        <p className="text-muted" style={{ marginBottom: 14 }}>
          Sube un Excel maestro. Luego elige la hoja correcta para la plantilla actual y usa sus columnas en la configuración de marcadores.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr .9fr .9fr auto', gap: 12, alignItems: 'end' }}>
          <div className="form-field">
            <label>Archivo Excel (.xlsx)</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="text" readOnly value={excelFilename || ''} placeholder="Selecciona un Excel" />
              <button className="btn btn-ghost" type="button" onClick={() => fileRef.current?.click()}>Examinar</button>
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx"
                className="hidden"
                onChange={e => onUploadExcel(e.target.files?.[0])}
              />
            </div>
          </div>

          <div className="form-field">
            <label>Hoja del Excel</label>
            <select value={sheetName} onChange={e => onSelectSheet(e.target.value)} disabled={!excelSheets.length}>
              <option value="">— Selecciona —</option>
              {excelSheets.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
            </select>
          </div>

          <div className="form-field">
            <label>Columna principal del nombre</label>
            <select value={nombreColumna} onChange={e => setNombreColumna(e.target.value)} disabled={!excelColumns.length}>
              <option value="">— Selecciona —</option>
              {excelColumns.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ paddingBottom: 6 }}>
            {totalRows > 0 && <span className="badge badge-green">{totalRows} registros</span>}
          </div>
        </div>

        {excelSheets.length > 0 && (
          <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {excelSheets.map(s => (
              <span key={s.name} className={`badge ${sheetName === s.name ? 'badge-blue' : 'badge-yellow'}`}>
                {s.name} · {s.total_rows} filas
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="actions">
        <div className="spacer" />
        <button className="btn btn-primary" onClick={onNext} disabled={!plantillaSelId || !excelFilename || !sheetName || !nombreColumna}>
          Continuar →
        </button>
      </div>
    </div>
  )
}
