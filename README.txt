Constancias React rediseñado completo

Cambios nuevos principales:
1. Ahora el flujo de generación acepta un Excel maestro .xlsx.
2. La página lee las hojas del Excel y te deja elegir cuál usar para cada lote.
3. La configuración de marcadores ya usa las columnas reales de la hoja seleccionada.
4. Se genera una constancia por cada fila de la hoja elegida.
5. El resultado final se descarga en un ZIP.

Cómo levantar el backend:
1. Abre una terminal en:
   constancias-react/backend/backend
2. Crea y activa entorno virtual:
   python -m venv venv
   venv\Scripts\activate
3. Instala dependencias:
   pip install -r requirements.txt
4. Ejecuta:
   uvicorn app.main:app --host 127.0.0.1 --port 8000

Cómo levantar el frontend:
1. Abre otra terminal en:
   constancias-react/constancias-react
2. Instala dependencias:
   npm install
3. Ejecuta:
   npm run dev

URLs:
Frontend: http://localhost:5173
Backend:  http://127.0.0.1:8000
Docs:     http://127.0.0.1:8000/docs

Login por defecto:
admin@uat.edu.mx
Admin2026!

Flujo recomendado:
1. Inicia sesión.
2. Selecciona una plantilla.
3. Sube tu Excel maestro.
4. Elige la hoja correcta, por ejemplo Evaluadores.
5. Elige la columna principal del nombre.
6. Configura marcadores como §N, §T1, §T2, etc.
7. Revisa la vista previa de filas.
8. Genera el ZIP final.
