FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libreoffice \
    cabextract \
    fonts-liberation \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p /app/data

EXPOSE 8080

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080} --h11-max-incomplete-event-size 65536"]
```

---

## Problema 2 — Previsualización

La función `_generar_thumbnail_desde_archivo` para PDFs usa `fitz` (PyMuPDF). Agrega al `requirements.txt`:
```
pymupdf
