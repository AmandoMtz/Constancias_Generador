import { useState } from 'react'
import { useApi } from '../../hooks/useApi'
import { useToast } from '../../context/ToastContext'
import { TIPOS_MARCADOR, TIPO_MARCADOR_MAP } from '../../constants'

export default function Paso2Marcadores({
  plantillaSelId, marcadores, setMarcadores,
  evento, setEvento, fecha, setFecha,
  excelColumns,
  onPrev, onNext,
}) {
  const { requestJSON } = useApi()
  const toast = useToast()
  const [detectMsg, setDetectMsg] = useState('')

  async function autoDetectar() {
    const d = await requestJSON(`/plantillas/${plantillaSelId}/marcadores-detectados`)
    if (!d) return
    const ya = new Set(marcadores.map(m => m.marcador))
    const defaultCol = excelColumns?.[0] || ''
    const nuevos = d.marcadores.filter(x => !ya.has(x))
    setMarcadores(prev => [
      ...prev,
      ...nuevos.map(m => ({ marcador: m, tipo: 'columna', columna: defaultCol, valor: '', columnas: '' })),
    ])
    const msg = nuevos.length ? `${nuevos.length} marcador(es) agregado(s)` : 'Todos ya estaban configurados'
    setDetectMsg(msg)
    setTimeout(() => setDetectMsg(''), 3000)
  }

  function addMarcador() {
    setMarcadores(prev => [
      ...prev,
      { marcador: '§NUEVO', tipo: 'columna', columna: excelColumns?.[0] || '', valor: '', columnas: '' },
    ])
  }

  function updateMarcador(i, key, val) {
    setMarcadores(prev => prev.map((m, idx) => idx === i ? { ...m, [key]: val } : m))
  }

  function changeTipo(i, tipo) {
    const m = marcadores[i]
    const next = { ...m, tipo }

    if (tipo === 'texto') {
      next.columna = ''
      next.columnas = ''
    } else if (tipo === 'columnas_join') {
      next.columna = ''
      next.valor = ''
    } else {
      next.valor = ''
      next.columnas = ''
      next.columna = m.columna || excelColumns?.[0] || ''
    }

    setMarcadores(prev => prev.map((item, idx) => idx === i ? next : item))
  }

  function deleteMarcador(i) {
    setMarcadores(prev => prev.filter((_, idx) => idx !== i))
  }

  function renderValorField(m, i) {
    const meta = TIPO_MARCADOR_MAP[m.tipo] || TIPO_MARCADOR_MAP.columna

    if (m.tipo === 'texto') {
      return (
        <input
          type="text"
          value={m.valor || ''}
          placeholder={meta.placeholder}
          onChange={e => updateMarcador(i, 'valor', e.target.value)}
        />
      )
    }

    if (m.tipo === 'columnas_join') {
      return (
        <input
          type="text"
          value={m.columnas || ''}
          placeholder={meta.placeholder}
          onChange={e => updateMarcador(i, 'columnas', e.target.value)}
        />
      )
    }

    return (
      <select value={m.columna || ''} onChange={e => updateMarcador(i, 'columna', e.target.value)}>
        <option value="">— Selecciona —</option>
        {excelColumns.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
    )
  }

  return (
    <div>
      <div className="panel">
        <div className="panel-title">Datos del evento</div>
        <div className="form-grid">
          <div className="form-field">
            <label>Nombre del evento</label>
            <input type="text" placeholder="Ej: 1ra Evaluación de Avance de Resultados 2026-1"
              value={evento} onChange={e => setEvento(e.target.value)} />
          </div>
          <div className="form-field">
            <label>Fecha del evento</label>
            <input type="text" placeholder="Ej: 24 al 27 de marzo de 2026"
              value={fecha} onChange={e => setFecha(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">Configuración de marcadores</div>
        <p className="text-muted" style={{ marginBottom: 14 }}>
          Aquí defines con qué columna del Excel se reemplaza cada marcador detectado en tu plantilla. Ahora cada tipo te muestra una explicación rápida para que sea más fácil elegirlo.
        </p>

        <div className="actions" style={{ marginTop: 0, marginBottom: 14 }}>
          <button className="btn btn-ghost btn-sm" onClick={autoDetectar}>🔍 Detectar automáticamente</button>
          <button className="btn btn-ghost btn-sm" onClick={addMarcador}>+ Agregar marcador</button>
          {detectMsg && <span style={{ fontSize: 12, color: 'var(--verde)', fontWeight: 600 }}>{detectMsg}</span>}
        </div>

        {marcadores.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '190px 1.15fr 1fr 40px', gap: 8, padding: '4px 0', marginBottom: 4 }}>
            {['Marcador en plantilla', 'Tipo', 'Valor / Columna', ''].map((l, i) => (
              <div key={i} style={{ fontSize: 10, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '.5px' }}>{l}</div>
            ))}
          </div>
        )}

        {marcadores.map((m, i) => {
          const meta = TIPO_MARCADOR_MAP[m.tipo] || TIPO_MARCADOR_MAP.columna
          return (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '190px 1.15fr 1fr 40px', gap: 8, marginBottom: 12, alignItems: 'start' }}>
              <input type="text" value={m.marcador || ''} onChange={e => updateMarcador(i, 'marcador', e.target.value)} />

              <div>
                <select value={m.tipo || 'columna'} onChange={e => changeTipo(i, e.target.value)}>
                  {TIPOS_MARCADOR.map((tipo) => <option key={tipo.value} value={tipo.value}>{tipo.label}</option>)}
                </select>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6 }}>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '.4px',
                    textTransform: 'uppercase',
                    color: 'var(--rojo)',
                    background: '#fff2f2',
                    border: '1px solid #ffd5d5',
                    borderRadius: 999,
                    padding: '3px 8px',
                  }}>{meta.badge}</span>
                  <span style={{ fontSize: 11, color: '#777', lineHeight: 1.35 }}>{meta.short}</span>
                </div>
              </div>

              <div>
                {renderValorField(m, i)}
                <div style={{ fontSize: 11, color: '#888', marginTop: 6 }}>{meta.placeholder}</div>
              </div>

              <button className="btn btn-danger btn-sm" type="button" onClick={() => deleteMarcador(i)}>×</button>
            </div>
          )
        })}

        {!marcadores.length && <div className="text-muted">Todavía no has configurado marcadores.</div>}
      </div>

      <div className="actions">
        <button className="btn btn-ghost" onClick={onPrev}>← Anterior</button>
        <div className="spacer" />
        <button className="btn btn-primary" onClick={onNext} disabled={!marcadores.length}>Continuar →</button>
      </div>
    </div>
  )
}
