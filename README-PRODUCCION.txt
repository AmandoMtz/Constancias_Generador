ARCHIVOS AGREGADOS PARA PRODUCCION INICIAL

1. backend/backend/.env.example
   Contiene las variables de entorno sugeridas para VPS Windows.

2. backend/backend/app/config.py
   Centraliza APP_DATA_DIR, uploads, excels, lotes y CORS.

3. Se cambiaron SECRET_KEY, admin por defecto y base SQLite para que dependan de variables de entorno.

4. El frontend ya puede seguir usando /api si lo publicas detras de un reverse proxy.

5. Ejemplo Caddyfile para Windows:

constancias.tudominio.com {
    root * C:\constancias\app\constancias-react\dist
    encode gzip

    handle /api/* {
        reverse_proxy 127.0.0.1:8000
    }

    handle {
        try_files {path} /index.html
        file_server
    }
}
