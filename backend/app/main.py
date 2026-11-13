"""Titik masuk server TandaTepat (FastAPI).

Menyediakan API di /api/... dan (bila sudah di-build) melayani aplikasi web
dari frontend/dist sehingga cukup satu server untuk deployment (Opsi A).
"""
import mimetypes

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import pengaturan
from .routers import sistem

# Pastikan manifest PWA dikirim dengan tipe yang benar di semua OS.
mimetypes.add_type("application/manifest+json", ".webmanifest")
mimetypes.add_type("text/javascript", ".js")

app = FastAPI(title="TandaTepat API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=pengaturan.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router API didaftarkan SEBELUM file statis agar /api/... tidak tertutup.
app.include_router(sistem.router)

if pengaturan.frontend_dist.is_dir():
    app.mount("/", StaticFiles(directory=pengaturan.frontend_dist, html=True), name="web")
