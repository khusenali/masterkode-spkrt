"""Ubah database Master SPKRT pusat (sumber/spkrt.db.gz) menjadi data app.

Hasil:
  data/master.json  -> tabel hierarki dalam bentuk array ringkas
  data/versi.json   -> info versi dan waktu pembaruan (WIB)

versi.json hanya diubah kalau isi master.json berubah.
"""
import gzip
import hashlib
import json
import sqlite3
import sys
import tempfile
from datetime import datetime, timedelta, timezone
from pathlib import Path

MIN_KUALITAS = 30000  # pengaman: tolak database yang terpotong atau kosong

TABEL = {
    "kelompok": "SELECT kd_kelompok, nama FROM kelompok ORDER BY kd_kelompok",
    "subkelompok": "SELECT kd_subkel, kd_kelompok, nama FROM subkelompok ORDER BY kd_subkel",
    "kelas": "SELECT kd_kelas, kd_subkel, nama FROM kelas ORDER BY kd_kelas",
    "komoditas": "SELECT kd_komoditas, kd_kelas, nama FROM komoditas ORDER BY kd_komoditas",
    "kualitas": "SELECT kd_kualitas, kd_komoditas, nama, satuan FROM kualitas ORDER BY kd_kualitas",
}


def main(sumber: str, folder_keluar: str) -> None:
    keluar = Path(folder_keluar)
    keluar.mkdir(parents=True, exist_ok=True)

    with tempfile.NamedTemporaryFile(suffix=".db") as tmp:
        tmp.write(gzip.decompress(Path(sumber).read_bytes()))
        tmp.flush()
        con = sqlite3.connect(f"file:{tmp.name}?mode=ro", uri=True)
        data = {nama: [list(r) for r in con.execute(q)] for nama, q in TABEL.items()}
        meta = dict(con.execute("SELECT key, last_sync FROM sync_meta").fetchall())
        con.close()

    n = len(data["kualitas"])
    if n < MIN_KUALITAS:
        sys.exit(f"GAGAL: kualitas hanya {n} baris (minimal {MIN_KUALITAS}). Data tidak diubah.")

    isi = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    file_master = keluar / "master.json"
    if file_master.exists() and file_master.read_text(encoding="utf-8") == isi:
        print("Data sama dengan versi sebelumnya. Tidak ada perubahan.")
        return

    file_master.write_text(isi, encoding="utf-8")
    wib = datetime.now(timezone(timedelta(hours=7)))
    versi = {
        "master_versi_pusat": meta.get("master_versi"),
        "sinkron_pusat": meta.get("last_sync"),
        "diperbarui": wib.isoformat(timespec="seconds"),
        "diperbarui_teks": wib.strftime("%d-%m-%Y %H.%M WIB"),
        "hash": hashlib.sha256(isi.encode("utf-8")).hexdigest()[:16],
        "jumlah": {k: len(v) for k, v in data.items()},
    }
    (keluar / "versi.json").write_text(json.dumps(versi, ensure_ascii=False, indent=2), encoding="utf-8")
    print("Diperbarui:", json.dumps(versi["jumlah"]))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
