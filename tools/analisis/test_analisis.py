"""Uji rumus analisis terhadap nilai acuan yang sudah diketahui."""
import math
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parent))
from analisis_data import (  # noqa: E402
    aiken_v,
    alfa_cronbach,
    efisiensi,
    main,
    n_gain,
    p_dua_sisi_t,
    skor_sus,
    uji_t_berpasangan,
)

CONTOH = Path(__file__).parent / "contoh"


def test_p_t_terhadap_tabel():
    # Nilai kritis tabel t: t(10) = 2,228 → p = 0,05 ; t(20) = 2,845 → p = 0,01 ; t(5) = 2,015 → p = 0,10
    assert p_dua_sisi_t(2.228, 10) == pytest.approx(0.05, abs=5e-4)
    assert p_dua_sisi_t(2.845, 20) == pytest.approx(0.01, abs=5e-4)
    assert p_dua_sisi_t(2.015, 5) == pytest.approx(0.10, abs=5e-4)
    assert p_dua_sisi_t(0, 8) == pytest.approx(1.0)


def test_aiken_v():
    # 3 validator, skala 1–4, skor 4,4,3 → (3+3+2)/(3·3) = 0,889
    assert aiken_v([4, 4, 3], terendah=1, kategori=4) == pytest.approx(8 / 9)
    assert aiken_v([4, 4], 1, 4) == 1.0


def test_sus():
    assert skor_sus([5, 1] * 5) == 100
    assert skor_sus([1, 5] * 5) == 0
    assert skor_sus([3] * 10) == 50
    with pytest.raises(ValueError):
        skor_sus([3] * 9)


def test_n_gain():
    assert n_gain(40, 70, 100) == pytest.approx(0.5)
    assert n_gain(100, 100, 100) is None


def test_uji_t_berpasangan():
    pre = [40, 50, 55, 60, 45]
    post = [70, 75, 70, 80, 72]
    h = uji_t_berpasangan(pre, post)
    assert h["df"] == 4
    assert h["rata_selisih"] == pytest.approx(23.4)
    # selisih = [30, 25, 15, 20, 27]; sd = √(141,2/4) = 5,9414; t = 23,4 / (5,9414/√5) = 8,8067
    assert h["t"] == pytest.approx(8.8067, abs=1e-3)
    assert h["p"] < 0.001


def test_alfa_cronbach():
    # Butir identik → alfa = 1
    assert alfa_cronbach([[1, 1], [2, 2], [3, 3]]) == pytest.approx(1.0)


def test_efisiensi_simetris():
    e = efisiensi([90, 70, 50], [3, 5, 7])
    assert e[0] > 0 > e[2]
    assert sum(e) == pytest.approx(0, abs=1e-12)
    assert e[0] == pytest.approx(2 * math.sqrt(1.5) / math.sqrt(2))


@pytest.mark.parametrize("perintah", [
    ["validasi", str(CONTOH / "validasi.csv")],
    ["sus", str(CONTOH / "sus.csv")],
    ["tes", str(CONTOH / "tes.csv")],
    ["reliabel", str(CONTOH / "sus.csv")],
    ["beban", str(CONTOH / "skala.csv"), "--tes", str(CONTOH / "tes.csv")],
    ["kesalahan", str(CONTOH / "jawaban.csv")],
])
def test_perintah_berjalan_dengan_file_contoh(perintah, capsys):
    main(perintah)
    assert capsys.readouterr().out.strip()
