FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libreoffice \
    fonts-liberation \
    fonts-dejavu \
    fonts-freefont-ttf \
    fontconfig \
    --no-install-recommends \
    && fc-cache -f -v \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p /app/data

EXPOSE 8080

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080} --h11-max-incomplete-event-size 65536"]
