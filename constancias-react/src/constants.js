export const PROGRAMAS = [
  { code: 'MCC', name: 'Maestría Ciencias Computación' },
  { code: 'MC',  name: 'Maestría en Construcción' },
  { code: 'MAI', name: 'Maestría Admin. Industrial' },
  { code: 'MIP', name: 'Maestría Ing. Portuaria' },
  { code: 'MCI', name: 'Maestría Ciencias Ingeniería' },
  { code: 'DCC', name: 'Doctorado Ciencias Comp.' },
  { code: 'DCI', name: 'Doctorado Ciencias Ing.' },
  { code: 'DII', name: 'Doctorado Ing. Industrial' },
]

export const TIPOS_MARCADOR = [
  {
    value: 'columna',
    label: 'Columna del Excel',
    short: 'Usa el valor tal cual viene en una columna.',
    placeholder: 'Selecciona la columna que reemplazará el marcador.',
    badge: 'Directo',
  },
  {
    value: 'texto',
    label: 'Texto fijo',
    short: 'El mismo texto para todas las constancias.',
    placeholder: 'Escribe el texto fijo que quieras insertar.',
    badge: 'Manual',
  },
  {
    value: 'nombre',
    label: 'Nombre corregido',
    short: 'Limpia títulos como Dr., Mtro., Lic. y deja el nombre limpio.',
    placeholder: 'Selecciona la columna del nombre.',
    badge: 'Nombre',
  },
  {
    value: 'trat_dr',
    label: 'Tratamiento Dr./Dra.',
    short: 'Genera automáticamente Dr. o Dra. con base en el contenido.',
    placeholder: 'Selecciona la columna base para detectar el tratamiento.',
    badge: 'Auto',
  },
  {
    value: 'trat_c',
    label: 'Tratamiento C.',
    short: 'Genera Al C. o A la C. de forma automática.',
    placeholder: 'Selecciona la columna base para detectar el tratamiento.',
    badge: 'Auto',
  },
  {
    value: 'columnas_join',
    label: 'Varias columnas unidas',
    short: 'Une varias columnas en un solo texto.',
    placeholder: 'Ejemplo: nombre_evaluador, Titulo_1, Titulo_2',
    badge: 'Combinar',
  },
]

export const TIPO_MARCADOR_MAP = Object.fromEntries(TIPOS_MARCADOR.map(t => [t.value, t]))

export const COLS_PERSONA = ['nombre', 'email', 'programa', 'matricula', 'cargo', 'departamento']
