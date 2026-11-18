# Satu image berisi aplikasi web (hasil build Vite) + server FastAPI (Opsi A, dokumen 10).
#   docker build -t tandatepat .
#   docker run -p 8000:8000 -e SECRET_KEY=... -v tandatepat-data:/data tandatepat

# ---- Tahap 1: build frontend (JavaScript)
FROM node:22-alpine AS web
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ---- Tahap 2: server (Python)
FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    FRONTEND_DIST=/app/frontend/dist \
    DATABASE_URL=sqlite:////data/tandatepat.db
WORKDIR /app/backend
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/app ./app
COPY --from=web /app/frontend/dist /app/frontend/dist
RUN useradd --create-home aplikasi && mkdir -p /data && chown aplikasi /data
USER aplikasi
VOLUME ["/data"]
EXPOSE 8000
# PORT diisi otomatis oleh sebagian layanan hosting (Render, Railway, dll.)
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --proxy-headers --forwarded-allow-ips='*'"]
