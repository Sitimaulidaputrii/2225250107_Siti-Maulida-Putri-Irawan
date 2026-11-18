"""Hash kata sandi/PIN (scrypt bawaan Python), token JWT, dan pembatas percobaan masuk."""
import hashlib
import hmac
import secrets
import time
from collections import defaultdict, deque
from datetime import UTC, datetime, timedelta

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlmodel import Session

from .config import pengaturan
from .db import get_session
from .models import Guru, Siswa

# ------------------------------------------------------------------ hash

_N, _R, _P = 2**14, 8, 1


def buat_hash(rahasia: str) -> str:
    garam = secrets.token_bytes(16)
    h = hashlib.scrypt(rahasia.encode(), salt=garam, n=_N, r=_R, p=_P, dklen=32)
    return f"scrypt${garam.hex()}${h.hex()}"


def cocokkan_hash(rahasia: str, tersimpan: str) -> bool:
    try:
        skema, garam_hex, hash_hex = tersimpan.split("$")
    except ValueError:
        return False
    if skema != "scrypt":
        return False
    h = hashlib.scrypt(rahasia.encode(), salt=bytes.fromhex(garam_hex), n=_N, r=_R, p=_P, dklen=32)
    return hmac.compare_digest(h.hex(), hash_hex)


# ------------------------------------------------------------------ token

UMUR_TOKEN = {
    "siswa": timedelta(days=120),  # panjang: aplikasi offline-first, siswa jarang masuk ulang
    "guru": timedelta(days=7),
}


def buat_token(peran: str, id_: int) -> str:
    isi = {"sub": f"{peran}:{id_}", "exp": datetime.now(UTC) + UMUR_TOKEN[peran]}
    return jwt.encode(isi, pengaturan.secret_key, algorithm="HS256")


def baca_token(token: str) -> tuple[str, int]:
    try:
        isi = jwt.decode(token, pengaturan.secret_key, algorithms=["HS256"])
        peran, id_ = isi["sub"].split(":")
        return peran, int(id_)
    except (jwt.PyJWTError, KeyError, ValueError):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Sesi tidak valid atau sudah berakhir.") from None


_bearer = HTTPBearer(auto_error=False)


def _ambil_id(kred: HTTPAuthorizationCredentials | None, peran_diminta: str) -> int:
    if kred is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Perlu masuk terlebih dahulu.")
    peran, id_ = baca_token(kred.credentials)
    if peran != peran_diminta:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Akses tidak diizinkan.")
    return id_


def siswa_saat_ini(
    kred: HTTPAuthorizationCredentials | None = Depends(_bearer), sesi: Session = Depends(get_session)
) -> Siswa:
    siswa = sesi.get(Siswa, _ambil_id(kred, "siswa"))
    if siswa is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Akun siswa tidak ditemukan.")
    return siswa


def guru_saat_ini(
    kred: HTTPAuthorizationCredentials | None = Depends(_bearer), sesi: Session = Depends(get_session)
) -> Guru:
    guru = sesi.get(Guru, _ambil_id(kred, "guru"))
    if guru is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Akun guru tidak ditemukan.")
    return guru


# ------------------------------------------------------- pembatas tebak PIN

BATAS_GAGAL = 5
JENDELA_DETIK = 10 * 60
_gagal: dict[str, deque] = defaultdict(deque)


def periksa_batas(kunci: str) -> None:
    antre = _gagal[kunci]
    batas_waktu = time.monotonic() - JENDELA_DETIK
    while antre and antre[0] < batas_waktu:
        antre.popleft()
    if len(antre) >= BATAS_GAGAL:
        raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, "Terlalu banyak percobaan. Coba lagi 10 menit lagi.")


def catat_gagal(kunci: str) -> None:
    _gagal[kunci].append(time.monotonic())


def reset_batas() -> None:
    _gagal.clear()
