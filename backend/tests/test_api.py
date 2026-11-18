import csv
import io

from conftest import auth


def percobaan(id_, benar=True, kode=None, level=3, petunjuk=False):
    return {
        "id": id_, "waktu_klien": "2026-11-18T08:00:00Z", "modul": "M4", "soal": "-2x > 8",
        "level": level, "fase": "mandiri", "benar": benar, "kode_kesalahan": kode, "pakai_petunjuk": petunjuk,
    }


# ------------------------------------------------------------------ guru

def test_guru_daftar_masuk_dan_tolak_sandi_salah(klien, guru):
    assert guru["guru"]["email"] == "guru@contoh.id"
    assert klien.post("/api/auth/guru/masuk", json={"email": "GURU@contoh.id", "sandi": "rahasia123"}).status_code == 200
    r = klien.post("/api/auth/guru/masuk", json={"email": "guru@contoh.id", "sandi": "salahsalah"})
    assert r.status_code == 401
    assert "salah" in r.json()["detail"]


def test_guru_email_ganda_ditolak(klien, guru):
    r = klien.post("/api/auth/guru/daftar", json={"nama": "Lain", "email": "guru@contoh.id", "sandi": "rahasia123"})
    assert r.status_code == 409


def test_validasi_masukan(klien):
    assert klien.post("/api/auth/guru/daftar", json={"nama": "A B", "email": "bukan-email", "sandi": "rahasia123"}).status_code == 422
    assert klien.post("/api/auth/guru/daftar", json={"nama": "A B", "email": "a@b.id", "sandi": "pendek"}).status_code == 422


def test_batas_percobaan_masuk(klien, guru):
    for _ in range(5):
        klien.post("/api/auth/guru/masuk", json={"email": "guru@contoh.id", "sandi": "salahsalah"})
    r = klien.post("/api/auth/guru/masuk", json={"email": "guru@contoh.id", "sandi": "rahasia123"})
    assert r.status_code == 429


# ------------------------------------------------------------------ kelas

def test_buat_dan_daftar_kelas(klien, guru, kelas):
    assert len(kelas["kode"]) == 6
    assert kelas["pengaturan"] == {"promptPenjelasan": True, "skalaBeban": False}
    daftar = klien.get("/api/kelas", headers=auth(guru["token"])).json()
    assert [k["nama"] for k in daftar] == ["IX-A"]
    assert daftar[0]["jumlah_siswa"] == 0


def test_guru_lain_tidak_bisa_melihat_kelas(klien, kelas):
    lain = klien.post("/api/auth/guru/daftar", json={"nama": "Pak Lain", "email": "lain@contoh.id", "sandi": "rahasia123"}).json()
    assert klien.get(f"/api/guru/kelas/{kelas['id']}/ringkasan", headers=auth(lain["token"])).status_code == 404
    assert klien.patch(f"/api/kelas/{kelas['id']}/pengaturan", json={"skalaBeban": True}, headers=auth(lain["token"])).status_code == 404


def test_tanpa_token_ditolak(klien):
    assert klien.get("/api/kelas").status_code == 401
    assert klien.post("/api/progres/percobaan", json=[]).status_code == 401


# ------------------------------------------------------------------ siswa

def test_siswa_gabung_masuk_dan_nama_ganda(klien, kelas, siswa):
    assert siswa["kelas"]["kode"] == kelas["kode"]
    data = {"kode_kelas": kelas["kode"].lower(), "nama_panggilan": "nadia", "pin": "1234"}
    assert klien.post("/api/auth/siswa/masuk", json=data).status_code == 200
    r = klien.post("/api/auth/siswa/gabung", json=data)
    assert r.status_code == 409
    assert "Sudah pernah gabung" in r.json()["detail"]
    assert klien.post("/api/auth/siswa/masuk", json={**data, "pin": "9999"}).status_code == 401


def test_kode_kelas_salah(klien):
    r = klien.post("/api/auth/siswa/gabung", json={"kode_kelas": "ZZZZZZ", "nama_panggilan": "Raka", "pin": "1111"})
    assert r.status_code == 404


def test_token_siswa_tidak_berlaku_untuk_guru(klien, siswa):
    assert klien.get("/api/kelas", headers=auth(siswa["token"])).status_code == 403


def test_siswa_membaca_pengaturan_kelas(klien, guru, kelas, siswa):
    klien.patch(f"/api/kelas/{kelas['id']}/pengaturan", json={"promptPenjelasan": False, "skalaBeban": True}, headers=auth(guru["token"]))
    r = klien.get("/api/kelas/saya", headers=auth(siswa["token"])).json()
    assert r["pengaturan"] == {"promptPenjelasan": False, "skalaBeban": True}


# ------------------------------------------------------------------ progres

def test_sinkron_idempoten(klien, siswa):
    h = auth(siswa["token"])
    kiriman = [percobaan("id-00000001"), percobaan("id-00000002", benar=False, kode="E1")]
    assert klien.post("/api/progres/percobaan", json=kiriman, headers=h).json() == {"diterima": 2, "sudah_ada": 0}
    assert klien.post("/api/progres/percobaan", json=kiriman, headers=h).json() == {"diterima": 0, "sudah_ada": 2}
    assert klien.get("/api/progres/saya", headers=h).json() == {"jumlah": 2, "benar": 1}


def test_skala_beban_validasi(klien, siswa):
    h = auth(siswa["token"])
    ok = [{"id": "sk-00000001", "waktu_klien": "x", "aktivitas": "M4/6", "jenis": "paas", "item": "usaha", "skor": 5}]
    assert klien.post("/api/progres/skala-beban", json=ok, headers=h).json() == {"diterima": 1}
    salah = [{**ok[0], "id": "sk-00000002", "skor": 10}]
    assert klien.post("/api/progres/skala-beban", json=salah, headers=h).status_code == 422
    item_salah = [{**ok[0], "id": "sk-00000003", "jenis": "leppink", "item": "XX1"}]
    assert klien.post("/api/progres/skala-beban", json=item_salah, headers=h).status_code == 422


# ------------------------------------------------------------------ dasbor guru

def test_ringkasan_dan_ekspor(klien, guru, kelas, siswa):
    h = auth(siswa["token"])
    klien.post("/api/progres/percobaan", headers=h, json=[
        percobaan("p-00000001", level=2),
        percobaan("p-00000002", benar=False, kode="E1", petunjuk=True),
        percobaan("p-00000003", benar=False, kode="E1"),
        percobaan("p-00000004", benar=False, kode="E3"),
        percobaan("p-00000005", level=3),
    ])
    skala = [{"id": f"sk-0000000{i}", "waktu_klien": "x", "aktivitas": "M4", "jenis": "leppink", "item": item, "skor": skor}
             for i, (item, skor) in enumerate([("IL1", 6), ("IL2", 8), ("EL1", 2), ("GL1", 9)])]
    klien.post("/api/progres/skala-beban", headers=h, json=skala)

    g = auth(guru["token"])
    d = klien.get(f"/api/guru/kelas/{kelas['id']}/ringkasan", headers=g).json()
    s = d["siswa"][0]
    assert s["nama_panggilan"] == "Nadia"
    assert (s["jumlah"], s["benar"], s["petunjuk"], s["level_tertinggi"], s["kesalahan_utama"]) == (5, 2, 1, 3, "E1")
    assert d["distribusi"] == {"E1": 2, "E3": 1}
    assert d["skala"]["leppink"] == {"IL": 7, "EL": 2, "GL": 9}

    r = klien.get(f"/api/guru/kelas/{kelas['id']}/ekspor.csv?jenis=percobaan", headers=g)
    assert r.headers["content-type"].startswith("text/csv")
    baris = list(csv.reader(io.StringIO(r.text.lstrip("﻿"))))
    assert baris[0][0] == "kode_siswa"
    assert len(baris) == 6
    assert all(b[0] == s["kode_pseudonim"] for b in baris[1:])
    assert "Nadia" not in r.text  # ekspor anonim

    r = klien.get(f"/api/guru/kelas/{kelas['id']}/ekspor.csv?jenis=skala", headers=g)
    assert len(list(csv.reader(io.StringIO(r.text.lstrip("﻿"))))) == 5
