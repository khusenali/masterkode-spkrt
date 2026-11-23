# Update otomatis Master SPKRT dari pusat

Server pusat hanya bisa diakses dari jaringan BPS. Karena itu pengambilan data
dilakukan dari browser petugas pengelola (1 klik), lalu sisanya otomatis di GitHub.

## Alur

1. Bookmarklet membaca database dari OPFS browser (file SQLite, sekitar 9,7 MB).
2. Bookmarklet mengunggah hasil gzip (sekitar 3 MB) ke `sumber/spkrt.db.gz` di repo `khusenali/masterkode-spkrt`.
3. GitHub Actions `update-master.yml` mengubahnya menjadi `data/master.json` dan `data/versi.json`, lalu commit.
4. GitHub Pages deploy ulang. Aplikasi mengunduh data baru saat dibuka (perlu internet),
   menampilkan ringkasan perubahan, dan memakainya setelah muat ulang.

## Pasang sekali

1. Salin folder `.github/` dan `tools/` ke root repo, lalu commit.
2. Cek nama branch utama repo. Kalau bukan `main`, ubah `BRANCH` di
   `tools/bookmarklet-sumber.js`, lalu buat ulang `tools/bookmarklet.txt`
   (awali dengan `javascript:` lalu isi file sumber yang sudah di-URL-encode).
3. Repo > Settings > Actions > General > Workflow permissions:
   pilih "Read and write permissions".
4. Buat token: GitHub > Settings > Developer settings > Fine-grained tokens.
   - Repository access: Only select repositories > `masterkode-spkrt`
   - Permissions: Contents = Read and write (yang lain No access)
   - Expiration: 7 sampai 30 hari
   Token ini TIDAK disimpan oleh bookmarklet. Simpan di pengelola kata sandi,
   lalu tempel setiap kali mengunggah.
5. Buat bookmark baru di Chrome. Nama: `Update Master SPKRT`.
   URL: seluruh isi `tools/bookmarklet.txt`.

## Setiap kali mau update

1. Sambung ke jaringan BPS.
2. Buka https://spkrt.web.bps.go.id/master/ sampai data tampil, lalu TUTUP tab itu.
3. Buka https://spkrt.web.bps.go.id/master/config.js
4. Klik bookmark `Update Master SPKRT`, tempel token saat diminta.
5. Tunggu 1-3 menit. Cek tab Actions di repo.
6. Buka aplikasi (atau Pengaturan > Periksa data pusat) untuk melihat ringkasan perubahan.

Kalau bookmark tidak jalan (diblokir browser atau situs), buka DevTools > Console
di halaman config.js, lalu tempel isi `tools/bookmarklet-sumber.js`.

## Keamanan

- Token tidak disimpan di browser. Token memberi hak menulis ke repo, termasuk kode
  aplikasi, jadi perlakukan seperti kata sandi, beri masa berlaku pendek, dan jangan
  pakai bookmarklet di komputer bersama.
- Kalau token bocor: hapus di GitHub > Fine-grained tokens, lalu buat yang baru.

## Pengaman data

- Konversi gagal (data aplikasi tidak berubah) kalau kualitas kurang dari 30.000 baris.
- Kalau data pusat sama, tidak ada unggahan dan tidak ada commit.
- Aplikasi hanya memakai data unduhan bila lolos pemeriksaan: format kode,
  kualitas minimal 30.000, komoditas minimal 90% dari data bawaan. Jika tidak, data lama dipakai.

## Format data

`data/master.json`: kelompok [kd, nama]; subkelompok [kd, kd_kelompok, nama];
kelas [kd, kd_subkel, nama]; komoditas [kd, kd_kelas, nama];
kualitas [kd 10 digit, kd_komoditas, nama, satuan].
`data/versi.json`: master_versi_pusat, sinkron_pusat, diperbarui, diperbarui_teks, hash, jumlah.
