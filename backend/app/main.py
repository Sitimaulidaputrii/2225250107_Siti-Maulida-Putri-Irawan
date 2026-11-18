"""Titik masuk server TandaTepat (FastAPI).

Menyediakan API di /api/... dan (bila sudah di-build) melayani aplikasi web
dari frontend/dist sehingga cukup satu server untuk deployment (Opsi A).
"""
import logging
import mimetypes
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import KUNCI_BAWAAN, pengaturan
from .db import siapkan_db
from .routers import auth, guru, kelas, progres, sistem

# Pastikan manifest PWA dikirim dengan tipe yang benar di semua OS.
mimetypes.add_type("application/manifest+json", ".webmanifest")
mimetypes.add_type("text/javascript", ".js")

log = logging.getLogger("tandatepat")


@asynccontextmanager
async def siklus(_app: FastAPI):
    if pengaturan.secret_key == KUNCI_BAWAAN:
        log.warning("SECRET_KEY masih bawaan. Atur SECRET_KEY di file .env sebelum dipakai siswa!")
    siapkan_db()
    yield


app = FastAPI(title="TandaTepat API", version=sistem.VERSI_APLIKASI, lifespan=siklus)

app.add_middleware(
    CORSMiddleware,
    allow_origins=pengaturan.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router API didaftarkan SEBELUM file statis agar /api/... tidak tertutup.
for r in (sistem, auth, kelas, progres, guru):
    app.include_router(r.router)

if pengaturan.frontend_dist.is_dir():
    app.mount("/", StaticFiles(directory=pengaturan.frontend_dist, html=True), name="web")
