"""Endpoint sistem: cek kesehatan server dan versi konten."""
from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["sistem"])

VERSI_APLIKASI = "0.1.0"
VERSI_KONTEN = "2026.11.0"


@router.get("/kesehatan")
def kesehatan() -> dict:
    return {"status": "ok", "versi": VERSI_APLIKASI}


@router.get("/konten/versi")
def versi_konten() -> dict:
    return {"versi": VERSI_KONTEN}
