import { useState, useEffect, useCallback } from 'react'
import { useApi } from '../../hooks/useApi'
import { useToast } from '../../context/ToastContext'
import Paso1Plantilla from './Paso1Plantilla'
import Paso2Marcadores from './Paso2Marcadores'
import Paso3Destinatarios from './Paso3Destinatarios'
import Paso4Envio from './Paso4Envio'
import './Generar.css'

const STEPS = [
  { n: 1, label: 'Plantilla y Excel' },
  { n: 2, label: 'Marcadores' },
  { n: 3, label: 'Revisión' },
  { n: 4, label: 'Generación' },
]

export default function Generar({ initialPlantillaId = null }) {
  const { requestJSON, request } = useApi()
  const toast = useToast()

  const [paso, setPaso] = useState(1)
  const [plantillas, setPlantillas] = useState([])
  const [plantillaSelId, setPlantillaSelId] = useState(initialPlantillaId)
  const [marcadores, setMarcadores] = useState([])
  const [evento, setEvento] = useState('')
  const [fecha, setFecha] = useState('')

  const [excelId, setExcelId] = useState('')
  const [excelFilename, setExcelFilename] = useState('')
  const [excelSheets, setExcelSheets] = useState([])
  const [sheetName, setSheetName] = useState('')
  const [excelColumns, setExcelColumns] = useState([])
  const [previewRows, setPreviewRows] = useState([])
  const [totalRows, setTotalRows] = useState(0)
  const [nombreColumna, setNombreColumna] = useState('')
  const [alumnos, setAlumnos] = useState([])
  const [selectedAlumnoIds, setSelectedAlumnoIds] = useState([])

  const cargarPlantillas = useCallback(async () => {
    const pls = await requestJSON('/plantillas/')
    if (pls) setPlantillas(pls)
  }, [requestJSON])

  useEffect(() => { cargarPlantillas() }, [cargarPlantillas])

  const cargarAlumnos = useCallback(async () => {
    const data = await requestJSON('/personas/?tipo=alumno&limit=500')
    if (data) setAlumnos(data)
  }, [requestJSON])

  useEffect(() => { cargarAlumnos() }, [cargarAlumnos])

  async function subirExcel(file) {
    if (!file) return
    const fd = new FormData()
    fd.append('archivo', file)
    const r = await request('/excel/upload', { method: 'POST', body: fd })
    if (!r) return
    const data = await r.json()
    if (!r.ok) {
      toast(data.detail || 'No se pudo leer el Excel', 'error')
      return
    }
    setExcelId(data.excel_id)
    setExcelFilename(data.filename)
    setExcelSheets(data.sheets || [])
    const first = data.sheets?.[0]?.name || ''
    setSheetName(first)
    if (first) await cargarSheet(data.excel_id, first)
    toast('Excel cargado correctamente', 'success')
  }

  async function cargarSheet(id, name) {
    const [cols, preview] = await Promise.all([
      requestJSON(`/excel/${id}/columns?sheet_name=${encodeURIComponent(name)}`),
      requestJSON(`/excel/${id}/preview?sheet_name=${encodeURIComponent(name)}&limit=8`),
    ])
    if (cols) {
      setExcelColumns(cols.columns || [])
      setTotalRows(cols.total_rows || 0)
      const firstCol = cols.columns?.[0] || ''
      setNombreColumna(prev => (prev && cols.columns?.includes(prev) ? prev : firstCol))
    }
    if (preview) {
      setPreviewRows(preview.rows || [])
      setTotalRows(preview.total_rows || 0)
    }
  }

  async function seleccionarHoja(name) {
    setSheetName(name)
    if (excelId && name) await cargarSheet(excelId, name)
  }

  function handleSelPlantilla(id) {
    setPlantillaSelId(id)
    const p = plantillas.find(x => x.id === id)
    if (p?.marcadores?.length) {
      setMarcadores(JSON.parse(JSON.stringify(p.marcadores)))
    } else {
      setMarcadores([])
    }
    setEvento(p?.evento || '')
    setFecha(p?.fecha_evento || '')
  }

  function irPaso(n) {
    if (n === 2 && !plantillaSelId) return toast('Selecciona una plantilla primero', 'error')
    if (n === 2 && !excelId) return toast('Sube un Excel primero', 'error')
    if (n === 2 && !sheetName) return toast('Selecciona una hoja del Excel', 'error')
    if (n === 2 && !nombreColumna) return toast('Selecciona la columna principal del nombre', 'error')
    if (n === 3 && !marcadores.length) return toast('Configura al menos un marcador', 'error')
    setPaso(n)
  }

  function resetWizard() {
    setPaso(1)
    setPlantillaSelId(null)
    setMarcadores([])
    setEvento('')
    setFecha('')
    setExcelId('')
    setExcelFilename('')
    setExcelSheets([])
    setSheetName('')
    setExcelColumns([])
    setPreviewRows([])
    setTotalRows(0)
    setNombreColumna('')
    setSelectedAlumnoIds([])
  }

  return (
    <div>
      <div className="stepper">
        {STEPS.map(s => (
          <div
            key={s.n}
            className={`step${paso === s.n ? ' active' : ''}${paso > s.n ? ' done' : ''}`}
            data-n={s.n}
            onClick={() => paso > s.n && irPaso(s.n)}
            style={{ cursor: paso > s.n ? 'pointer' : 'default' }}
          >
            <div className="step-num">{paso > s.n ? '✓' : s.n}</div>
            {s.label}
          </div>
        ))}
      </div>

      {paso === 1 && (
        <Paso1Plantilla
          plantillas={plantillas}
          plantillaSelId={plantillaSelId}
          onSelPlantilla={handleSelPlantilla}
          excelFilename={excelFilename}
          excelSheets={excelSheets}
          sheetName={sheetName}
          onUploadExcel={subirExcel}
          onSelectSheet={seleccionarHoja}
          nombreColumna={nombreColumna}
          setNombreColumna={setNombreColumna}
          excelColumns={excelColumns}
          totalRows={totalRows}
          onNext={() => irPaso(2)}
        />
      )}

      {paso === 2 && (
        <Paso2Marcadores
          plantillaSelId={plantillaSelId}
          marcadores={marcadores}
          setMarcadores={setMarcadores}
          evento={evento}
          setEvento={setEvento}
          fecha={fecha}
          setFecha={setFecha}
          excelColumns={excelColumns}
          onPrev={() => setPaso(1)}
          onNext={() => irPaso(3)}
        />
      )}

      {paso === 3 && (
        <Paso3Destinatarios
          excelFilename={excelFilename}
          sheetName={sheetName}
          nombreColumna={nombreColumna}
          excelColumns={excelColumns}
          previewRows={previewRows}
          totalRows={totalRows}
          marcadores={marcadores}
          alumnos={alumnos}
          selectedAlumnoIds={selectedAlumnoIds}
          setSelectedAlumnoIds={setSelectedAlumnoIds}
          onPrev={() => setPaso(2)}
          onNext={() => irPaso(4)}
        />
      )}

      {paso === 4 && (
        <Paso4Envio
          plantillaSelId={plantillaSelId}
          marcadores={marcadores}
          evento={evento}
          fecha={fecha}
          totalRows={totalRows}
          excelSource={{ excel_id: excelId, sheet_name: sheetName, nombre_columna: nombreColumna }}
          excelFilename={excelFilename}
          sheetName={sheetName}
          alumnos={alumnos}
          selectedAlumnoIds={selectedAlumnoIds}
          onPrev={() => setPaso(3)}
          onReset={resetWizard}
        />
      )}
    </div>
  )
}
